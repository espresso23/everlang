"use client";
import { useConfirmation } from "@/components/confirmation";
import { EditorialDesk } from "@/components/editorial-desk";
import { StudentPreview, type EditorialItem } from "@/components/editorial-preview";
import { useEffect, useState } from "react";
import Link from "next/link";
import { request } from "@/lib/client";
import {
  knowledgeKinds,
  knowledgeLabels,
  type KnowledgeContent,
} from "@everlang/contracts/knowledge-contract";
import "@/app/knowledge/knowledge.css";

type Item = {
  key: string;
  revision: number;
  editVersion: number;
  status: "draft" | "reviewed" | "published";
  content: KnowledgeContent;
};
const blank: KnowledgeContent = {
  title: "",
  kind: "grammar",
  level: "Trung cấp",
  topic: "",
  summary: "",
  source: "",
  rights: "",
  sections: [{ id: "meaning", heading: "Ý nghĩa và cách dùng", text: "" }],
  examples: [{ ko: "", vi: "" }],
  related: [],
  questions: [],
};

export default function KnowledgeAdmin() {
  const confirm = useConfirmation();
  const [preview, setPreview] = useState<EditorialItem | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<Item | null>(null);
  const [content, setContent] = useState<KnowledgeContent>(blank);
  const [key, setKey] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  async function load() {
    const p = await request<{ items: Item[] }>("/api/admin/knowledge");
    setItems(p.items);
  }
  useEffect(() => {
    let live = true;
    request<{ items: Item[] }>("/api/admin/knowledge")
      .then((p) => {
        if (live) setItems(p.items);
      })
      .catch((e) => {
        if (live) setMessage(e.message);
      });
    return () => {
      live = false;
    };
  }, []);
  const editable = !selected || selected.status === "draft";
  function change(patch: Partial<KnowledgeContent>) {
    setContent((c) => ({ ...c, ...patch }));
    setDirty(true);
  }
  async function choose(item: Item | null) {
    if (dirty && !(await confirm({ message: "Bỏ thay đổi chưa lưu trong editor?", confirmLabel: "Bỏ thay đổi" }))) return false;
    setSelected(item);
    setContent(item ? structuredClone(item.content) : structuredClone(blank));
    setKey(item?.key || "");
    setDirty(false);
    setMessage("");
    return true;
  }
  async function action(
    action: "edit" | "review" | "publish" | "fork" | "revise",
  ) {
    if (action === "publish" && selected) { setPreview(structuredClone(selected)); return; }
    setBusy(true);
    setMessage("");
    try {
      const p = selected
        ? await request<{ item: Item }>("/api/admin/knowledge", "PATCH", {
            key: selected.key,
            revision: selected.revision,
            editVersion: selected.editVersion,
            action,
            ...(action === "edit" ? { content } : {}),
          })
        : await request<{ item: Item }>("/api/admin/knowledge", "POST", {
            key,
            content,
          });
      setSelected(p.item);
      setContent(p.item.content);
      setKey(p.item.key);
      setDirty(false);
      await load();
      setMessage(
        action === "publish"
          ? "Đã xuất bản. Người học có thể đọc tài liệu."
          : "Đã lưu thay đổi.",
      );
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="page">
      <Link href="/admin">← Quản trị học liệu</Link>
      <p className="eyebrow">BIÊN TẬP · REVIEW · XUẤT BẢN</p>
      <h1 className="page-title">Thư viện kiến thức</h1>
      <p className="muted">
        Chỉ xác nhận đã duyệt khi bạn đã kiểm tiếng Hàn, nghĩa, ví dụ, đáp án và
        quyền sử dụng. Nội dung nháp không hiển thị với người học.
      </p>
      <p className="notice" role="status">
        {message}
      </p>
      <EditorialDesk endpoint="/api/admin/knowledge" refreshToken={items} onSelect={row => choose(row as Item)} />
      {preview && <StudentPreview item={preview} endpoint="/api/admin/knowledge" onClose={() => setPreview(null)} onPublished={row => { void load(); choose(row as Item); setMessage("Đã xuất bản. Người học có thể đọc tài liệu."); }} />}
      <div className="dashboard-grid">
        <section className="panel">
          <h2>Phiên bản học liệu</h2>
          <button
            className="soft-button"
            disabled={busy}
            onClick={() => choose(null)}
          >
            Tạo tài liệu
          </button>
          <button
            className="soft-button"
            disabled={busy}
            onClick={() => load().catch((e) => setMessage(e.message))}
          >
            Tải danh sách mới
          </button>
          <p>Mở một bản ở bảng phía trên để biên tập; bản nháp chưa hiển thị với học viên.</p>
        </section>
        <section className="panel">
          <h2>
            {selected
              ? `Phiên bản ${selected.revision} · ${selected.status}`
              : "Tài liệu mới"}
          </h2>
          <form
            className="knowledge-editor"
            onSubmit={(e) => {
              e.preventDefault();
              void action("edit");
            }}
          >
            <fieldset disabled={busy || !editable}>
              <legend>Nội dung chính</legend>
              <label>
                Mã ổn định (chữ thường, số, dấu gạch nối)
                <input
                  required
                  pattern="[a-z0-9-]{1,80}"
                  className="control-input"
                  disabled={Boolean(selected)}
                  value={key}
                  onChange={(e) => {
                    setKey(e.target.value);
                    setDirty(true);
                  }}
                />
              </label>
              <label>
                Tiêu đề
                <input
                  required
                  maxLength={200}
                  className="control-input"
                  value={content.title}
                  onChange={(e) => change({ title: e.target.value })}
                />
              </label>
              <label>
                Loại
                <select
                  className="control-input"
                  value={content.kind}
                  onChange={(e) =>
                    change({ kind: e.target.value as KnowledgeContent["kind"] })
                  }
                >
                  {knowledgeKinds.map((k) => (
                    <option key={k} value={k}>
                      {knowledgeLabels[k]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Trình độ
                <select
                  className="control-input"
                  value={content.level}
                  onChange={(e) =>
                    change({
                      level: e.target.value as KnowledgeContent["level"],
                    })
                  }
                >
                  {["Sơ cấp", "Trung cấp", "Cao cấp"].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </label>
              <label>
                Chủ đề
                <input
                  required
                  maxLength={120}
                  className="control-input"
                  value={content.topic}
                  onChange={(e) => change({ topic: e.target.value })}
                />
              </label>
              <label>
                Tóm tắt và nghĩa
                <textarea
                  required
                  maxLength={1000}
                  className="control-input"
                  value={content.summary}
                  onChange={(e) => change({ summary: e.target.value })}
                />
              </label>
              <label>
                Nguồn
                <input
                  required
                  maxLength={500}
                  className="control-input"
                  value={content.source}
                  onChange={(e) => change({ source: e.target.value })}
                />
              </label>
              <label>
                Quyền sử dụng
                <textarea
                  required
                  maxLength={1000}
                  className="control-input"
                  value={content.rights}
                  onChange={(e) => change({ rights: e.target.value })}
                />
              </label>
              <label>
                Tài liệu liên quan (đã xuất bản)
                <select
                  multiple
                  size={5}
                  className="control-input"
                  value={content.related}
                  onChange={(e) =>
                    change({
                      related: Array.from(
                        e.target.selectedOptions,
                        (option) => option.value,
                      ),
                    })
                  }
                >
                  {Array.from(
                    new Map(
                      items
                        .filter(
                          (item) =>
                            item.status === "published" && item.key !== key,
                        )
                        .map((item) => [item.key, item]),
                    ).values(),
                  ).map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.content.title}
                    </option>
                  ))}
                </select>
                <span className="muted small">
                  Có thể chọn nhiều tài liệu; không tạo liên kết tới bản nháp.
                </span>
              </label>
              <h3>Các phần trong bài</h3>
              {content.sections.map((s, i) => (
                <fieldset key={i}>
                  <legend>Phần {i + 1}</legend>
                  <label>
                    Mã mục
                    <input
                      required
                      className="control-input"
                      pattern="[a-z0-9-]{1,60}"
                      value={s.id}
                      onChange={(e) =>
                        change({
                          sections: content.sections.map((v, n) =>
                            n === i ? { ...v, id: e.target.value } : v,
                          ),
                        })
                      }
                    />
                  </label>
                  <label>
                    Tiêu đề mục
                    <input
                      required
                      className="control-input"
                      value={s.heading}
                      onChange={(e) =>
                        change({
                          sections: content.sections.map((v, n) =>
                            n === i ? { ...v, heading: e.target.value } : v,
                          ),
                        })
                      }
                    />
                  </label>
                  <label>
                    Giải thích
                    <textarea
                      required
                      rows={5}
                      className="control-input"
                      value={s.text}
                      onChange={(e) =>
                        change({
                          sections: content.sections.map((v, n) =>
                            n === i ? { ...v, text: e.target.value } : v,
                          ),
                        })
                      }
                    />
                  </label>
                  <button
                    className="text-button"
                    type="button"
                    disabled={content.sections.length === 1}
                    onClick={() =>
                      change({
                        sections: content.sections.filter((_, n) => n !== i),
                      })
                    }
                  >
                    Xóa phần
                  </button>
                </fieldset>
              ))}
              <button
                className="soft-button"
                type="button"
                disabled={content.sections.length >= 30}
                onClick={() =>
                  change({
                    sections: [
                      ...content.sections,
                      {
                        id: `section-${content.sections.length + 1}`,
                        heading: "",
                        text: "",
                      },
                    ],
                  })
                }
              >
                Thêm phần giải thích
              </button>
              <h3>Ví dụ song ngữ</h3>
              {content.examples.map((example, i) => (
                <fieldset key={i}>
                  <legend>Ví dụ {i + 1}</legend>
                  <label>
                    Câu tiếng Hàn
                    <input
                      required
                      className="control-input"
                      value={example.ko}
                      onChange={(e) =>
                        change({
                          examples: content.examples.map((v, n) =>
                            n === i ? { ...v, ko: e.target.value } : v,
                          ),
                        })
                      }
                    />
                  </label>
                  <label>
                    Nghĩa tiếng Việt
                    <input
                      required
                      className="control-input"
                      value={example.vi}
                      onChange={(e) =>
                        change({
                          examples: content.examples.map((v, n) =>
                            n === i ? { ...v, vi: e.target.value } : v,
                          ),
                        })
                      }
                    />
                  </label>
                  <button
                    className="text-button"
                    type="button"
                    disabled={content.examples.length === 1}
                    onClick={() =>
                      change({
                        examples: content.examples.filter((_, n) => n !== i),
                      })
                    }
                  >
                    Xóa ví dụ
                  </button>
                </fieldset>
              ))}
              <button
                type="button"
                className="soft-button"
                disabled={content.examples.length >= 20}
                onClick={() =>
                  change({
                    examples: [...content.examples, { ko: "", vi: "" }],
                  })
                }
              >
                Thêm ví dụ
              </button>
              <h3>Bài tập</h3>
              {content.questions.map((q, i) => (
                <fieldset key={i}>
                  <legend>Câu hỏi {i + 1}</legend>
                  <label>
                    Loại bài
                    <select
                      className="control-input"
                      value={q.type}
                      onChange={(e) =>
                        change({
                          questions: content.questions.map((v, n) =>
                            n === i
                              ? {
                                  ...v,
                                  type: e.target.value as "choice" | "cloze",
                                  options: [],
                                  answers: [""],
                                }
                              : v,
                          ),
                        })
                      }
                    >
                      <option value="cloze">Điền khuyết</option>
                      <option value="choice">Trắc nghiệm</option>
                    </select>
                  </label>
                  <label>
                    Câu hỏi
                    <input
                      required
                      className="control-input"
                      value={q.prompt}
                      onChange={(e) =>
                        change({
                          questions: content.questions.map((v, n) =>
                            n === i ? { ...v, prompt: e.target.value } : v,
                          ),
                        })
                      }
                    />
                  </label>
                  {q.type === "choice" && (
                    <label>
                      Lựa chọn (mỗi dòng một lựa chọn)
                      <textarea
                        required
                        className="control-input"
                        value={q.options.join("\n")}
                        onChange={(e) =>
                          change({
                            questions: content.questions.map((v, n) =>
                              n === i
                                ? { ...v, options: e.target.value.split("\n") }
                                : v,
                            ),
                          })
                        }
                      />
                    </label>
                  )}
                  <label>
                    Đáp án chấp nhận (mỗi dòng một đáp án; trắc nghiệm chỉ một)
                    <textarea
                      required
                      className="control-input"
                      value={q.answers.join("\n")}
                      onChange={(e) =>
                        change({
                          questions: content.questions.map((v, n) =>
                            n === i
                              ? { ...v, answers: e.target.value.split("\n") }
                              : v,
                          ),
                        })
                      }
                    />
                  </label>
                  <label>
                    Giải thích
                    <textarea
                      required
                      className="control-input"
                      value={q.explanation}
                      onChange={(e) =>
                        change({
                          questions: content.questions.map((v, n) =>
                            n === i ? { ...v, explanation: e.target.value } : v,
                          ),
                        })
                      }
                    />
                  </label>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() =>
                      change({
                        questions: content.questions.filter((_, n) => n !== i),
                      })
                    }
                  >
                    Xóa câu hỏi
                  </button>
                </fieldset>
              ))}
              <button
                type="button"
                className="soft-button"
                disabled={content.questions.length >= 15}
                onClick={() =>
                  change({
                    questions: [
                      ...content.questions,
                      {
                        id: crypto.randomUUID(),
                        type: "cloze",
                        prompt: "",
                        options: [],
                        answers: [""],
                        explanation: "",
                      },
                    ],
                  })
                }
              >
                Thêm bài tập
              </button>
            </fieldset>
            <div className="actions">
              {editable && (
                <button
                  className="primary-button"
                  disabled={busy}
                  type="submit"
                >
                  Lưu bản nháp
                </button>
              )}
              {selected?.status === "draft" && (
                <button
                  className="soft-button"
                  type="button"
                  disabled={busy || dirty}
                  onClick={async () => {
                    if (
                      (await confirm({ message: "Xác nhận đã kiểm nội dung, đáp án, nguồn và quyền sử dụng?", confirmLabel: "Xác nhận đã duyệt" }))
                    )
                      void action("review");
                  }}
                >
                  Xác nhận đã duyệt
                </button>
              )}
              {selected?.status === "reviewed" && (
                <button
                  className="soft-button"
                  type="button"
                  disabled={busy}
                  onClick={() => void action("revise")}
                >
                  Trả về nháp để sửa
                </button>
              )}
              {selected?.status === "reviewed" && (
                <button
                  className="primary-button"
                  type="button"
                  disabled={busy}
                  onClick={() => void action("publish")}
                >
                  Xuất bản
                </button>
              )}
              {selected?.status === "published" && (
                <button
                  className="soft-button"
                  type="button"
                  disabled={busy}
                  onClick={() => void action("fork")}
                >
                  Tạo phiên bản mới để sửa
                </button>
              )}
            </div>
          </form>
          <Link href="/knowledge">Xem thư viện người học →</Link>
        </section>
      </div>
    </main>
  );
}
