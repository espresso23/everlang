"use client";
import { EditorialDesk } from "@/components/editorial-desk";
import { StudentPreview, type EditorialItem } from "@/components/editorial-preview";
import { useEffect, useState } from "react";
import Link from "next/link";
import { request } from "@/lib/client";
import {
  CATALOG_TAXONOMY_VERSION,
  catalogTopics,
  catalogContentSchema,
  type CatalogContent,
  type CatalogRecord,
} from "@everlang/contracts/vocabulary-catalog-contract";
import "@/app/word-sets/word-sets.css";

function blank(kind: "sense" | "set"): CatalogContent {
  const common = {
    language: "ko" as const,
    skill: "vocabulary" as const,
    taxonomyVersion:
      CATALOG_TAXONOMY_VERSION as typeof CATALOG_TAXONOMY_VERSION,
    level: "Trung cấp" as const,
    topics: ["food"],
    source: "",
    rights: "",
  };
  return kind === "sense"
    ? {
        ...common,
        kind,
        term: "",
        pos: "Danh từ",
        meaning: "",
        pronunciation: "",
        hanja: "",
        register: "Trung tính",
        usage: "",
        collocations: [],
        examples: [{ ko: "", vi: "" }],
      }
    : { ...common, kind, title: "", summary: "", senses: [] };
}
const statusLabels = {
  draft: "Nháp",
  reviewed: "Đã duyệt",
  published: "Đã xuất bản",
};
type Choice = { key: string; revision: number; title: string; meaning: string };
export default function WordSetsAdmin() {
  const [preview, setPreview] = useState<EditorialItem | null>(null);
  const [kind, setKind] = useState<"sense" | "set">("sense");
  const [offset, setOffset] = useState(0);
  const [items, setItems] = useState<CatalogRecord[]>([]);
  const [selected, setSelected] = useState<CatalogRecord | null>(null);
  const [content, setContent] = useState<CatalogContent>(blank("sense"));
  const [key, setKey] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [search, setSearch] = useState("");
  const [choiceOffset, setChoiceOffset] = useState(0);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [choicesTotal, setChoicesTotal] = useState(0);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let live = true;
    request<{ items: CatalogRecord[]; total: number }>(
      `/api/admin/word-sets?kind=${kind}&offset=${offset}`,
    )
      .then((p) => {
        if (live) {
          setItems(p.items);
        }
      })
      .catch((e) => {
        if (live) setMessage(e.message);
      });
    return () => {
      live = false;
    };
  }, [kind, offset, refresh]);
  useEffect(() => {
    const guard = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);
  const editable = !selected || selected.status === "draft";
  function change(next: CatalogContent) {
    setContent(next);
    setDirty(true);
    setReviewConfirmed(false);
  }
  function choose(item: CatalogRecord | null, nextKind = kind) {
    if (dirty && !window.confirm("Bỏ thay đổi chưa lưu trong form?"))
      return false;
    setSelected(item);
    setKey(item?.key || "");
    setContent(item ? structuredClone(item.content) : blank(nextKind));
    setDirty(false);
    setReviewConfirmed(false);
    setMessage("");
    if (item?.content.kind === "set") {
      request<{
        references: (Choice & { status: keyof typeof statusLabels })[];
      }>(
        `/api/admin/word-sets?key=${encodeURIComponent(item.key)}&revision=${item.revision}`,
      )
        .then((p) =>
          setLabels((old) => ({
            ...old,
            ...Object.fromEntries(
              p.references.map((c) => [
                `${c.key}:${c.revision}`,
                `${c.title} — ${c.meaning} (${statusLabels[c.status]})`,
              ]),
            ),
          })),
        )
        .catch((e) => setMessage(e.message));
    }
    return true;
  }
  async function transition(
    action: "edit" | "review" | "publish" | "fork" | "revise",
  ) {
    if (action === "publish" && selected) { setPreview(structuredClone(selected)); return; }
    if (action === "edit") {
      const parsed = catalogContentSchema.safeParse(content);
      if (!parsed.success) {
        setMessage(
          "Kiểm tra nội dung ở " +
            parsed.error.issues[0].path.join(".") +
            ": " +
            parsed.error.issues[0].message,
        );
        return;
      }
    }
    setBusy(true);
    setMessage("");
    try {
      const p = selected
        ? await request<{ item: CatalogRecord }>(
            "/api/admin/word-sets",
            "PATCH",
            {
              key: selected.key,
              revision: selected.revision,
              editVersion: selected.editVersion,
              action,
              ...(action === "edit" ? { content } : {}),
              ...(action === "review" ? { reviewConfirmed } : {}),
            },
          )
        : await request<{ item: CatalogRecord }>(
            "/api/admin/word-sets",
            "POST",
            { key, content },
          );
      setSelected(p.item);
      setKey(p.item.key);
      setContent(p.item.content);
      setDirty(false);
      setReviewConfirmed(false);
      setRefresh((n) => n + 1);
      setMessage(
        action === "publish" ? "Đã xuất bản revision này." : "Đã lưu thay đổi.",
      );
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function findChoices(page = 0) {
    setBusy(true);
    try {
      const p = await request<{ items: Choice[]; total: number }>(
        `/api/word-sets?kind=sense&q=${encodeURIComponent(search)}&offset=${page}`,
      );
      setChoices(p.items);
      setChoicesTotal(p.total);
      setChoiceOffset(page);
      setLabels((old) => ({
        ...old,
        ...Object.fromEntries(
          p.items.map((c) => [
            `${c.key}:${c.revision}`,
            `${c.title} — ${c.meaning}`,
          ]),
        ),
      }));
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="page">
      <Link
        href="/admin"
        onClick={(e) => {
          if (dirty && !window.confirm("Bỏ thay đổi chưa lưu để rời trang?"))
            e.preventDefault();
        }}
      >
        ← Quản trị học liệu
      </Link>
      <p className="eyebrow">BIÊN SOẠN · DUYỆT · XUẤT BẢN</p>
      <h1 className="page-title">Bộ từ & nghĩa</h1>
      <p className="muted">
        Mỗi nghĩa có mã riêng; các bộ dùng chung nghĩa và pin phiên bản. Xuất
        bản từng nghĩa trước khi duyệt bộ. Nội dung nháp và ví dụ AI cần bạn
        kiểm trước khi xuất bản.
      </p>
      <p className={message ? "notice" : "sr-only"} role="status">
        {message}
      </p>
      <div className="task-actions spaced">
        <button
          className="soft-button"
          disabled={busy}
          aria-pressed={kind === "sense"}
          onClick={() => {
            if (choose(null, "sense")) {
              setKind("sense");
              setOffset(0);
            }
          }}
        >
          Nghĩa của từ
        </button>
        <button
          className="soft-button"
          disabled={busy}
          aria-pressed={kind === "set"}
          onClick={() => {
            if (choose(null, "set")) {
              setKind("set");
              setOffset(0);
            }
          }}
        >
          Bộ từ
        </button>
        <button
          className="text-button"
          disabled={busy}
          onClick={() => choose(null)}
        >
          Tạo mục mới
        </button>
      </div>
      <button
        className="text-button"
        disabled={busy}
        onClick={() => setRefresh((n) => n + 1)}
      >
        Tải lại danh sách (giữ form)
      </button>
      <EditorialDesk key={kind} endpoint="/api/admin/word-sets" kind={kind} refreshToken={items} onSelect={row => choose(row as CatalogRecord)} />
      {preview && <StudentPreview item={preview} endpoint="/api/admin/word-sets" onClose={() => setPreview(null)} onPublished={row => { setRefresh(n => n + 1); choose(row as CatalogRecord); setMessage("Đã xuất bản revision này."); }} />}
      <div className="spaced">
        <section className="panel catalog-editor">
          <h2>
            {selected
              ? `Phiên bản ${selected.revision} · ${statusLabels[selected.status]}`
              : "Nội dung mới"}
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void transition("edit");
            }}
          >
            <fieldset disabled={busy || !editable}>
              <legend>
                Nội dung {content.kind === "sense" ? "nghĩa" : "bộ từ"}
              </legend>
              <label>
                Mã ổn định
                <input
                  className="control-input"
                  required
                  pattern="[a-z0-9-]{1,80}"
                  maxLength={80}
                  value={key}
                  disabled={Boolean(selected)}
                  onChange={(e) => {
                    setKey(e.target.value);
                    setDirty(true);
                  }}
                />
              </label>
              <label>
                Trình độ
                <select
                  className="control-input"
                  value={content.level}
                  onChange={(e) =>
                    change({
                      ...content,
                      level: e.target.value as CatalogContent["level"],
                    })
                  }
                >
                  {["Sơ cấp", "Trung cấp", "Cao cấp"].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </label>
              <label>
                Chủ đề (chọn 1–4)
                <select
                  className="control-input"
                  multiple
                  size={5}
                  value={content.topics}
                  onChange={(e) =>
                    change({
                      ...content,
                      topics: Array.from(
                        e.target.selectedOptions,
                        (o) => o.value,
                      ),
                    })
                  }
                >
                  {catalogTopics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.group} · {t.label}
                    </option>
                  ))}
                </select>
              </label>
              {content.kind === "sense" ? (
                <>
                  <label>
                    Từ tiếng Hàn
                    <input
                      className="control-input"
                      lang="ko"
                      required
                      maxLength={200}
                      value={content.term}
                      onChange={(e) =>
                        change({ ...content, term: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Từ loại
                    <select
                      className="control-input"
                      value={content.pos}
                      onChange={(e) =>
                        change({
                          ...content,
                          pos: e.target.value as typeof content.pos,
                        })
                      }
                    >
                      {[
                        "Danh từ",
                        "Động từ",
                        "Tính từ",
                        "Trạng từ",
                        "Cụm từ",
                        "Khác",
                      ].map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Nghĩa Việt (chỉ một nghĩa cụ thể)
                    <textarea
                      className="control-input"
                      required
                      maxLength={1000}
                      value={content.meaning}
                      onChange={(e) =>
                        change({ ...content, meaning: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Cách đọc Hangul
                    <input
                      className="control-input"
                      lang="ko"
                      maxLength={200}
                      value={content.pronunciation}
                      onChange={(e) =>
                        change({ ...content, pronunciation: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Hanja khi hữu ích
                    <input
                      className="control-input"
                      maxLength={100}
                      value={content.hanja}
                      onChange={(e) =>
                        change({ ...content, hanja: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Sắc thái
                    <select
                      className="control-input"
                      value={content.register}
                      onChange={(e) =>
                        change({
                          ...content,
                          register: e.target.value as typeof content.register,
                        })
                      }
                    >
                      {["Trung tính", "Trang trọng", "Thân mật"].map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Cách dùng và hạn chế
                    <textarea
                      className="control-input"
                      maxLength={2000}
                      value={content.usage}
                      onChange={(e) =>
                        change({ ...content, usage: e.target.value })
                      }
                    />
                  </label>
                  <h3>Cụm kết hợp</h3>
                  {content.collocations.map((c, i) => (
                    <div className="catalog-repeat" key={i}>
                      <label>
                        Cụm tiếng Hàn {i + 1}
                        <input
                          className="control-input"
                          required
                          value={c.ko}
                          maxLength={1000}
                          onChange={(e) =>
                            change({
                              ...content,
                              collocations: content.collocations.map((x, j) =>
                                j === i ? { ...x, ko: e.target.value } : x,
                              ),
                            })
                          }
                        />
                      </label>
                      <label>
                        Nghĩa cụm {i + 1}
                        <input
                          className="control-input"
                          required
                          value={c.vi}
                          maxLength={1000}
                          onChange={(e) =>
                            change({
                              ...content,
                              collocations: content.collocations.map((x, j) =>
                                j === i ? { ...x, vi: e.target.value } : x,
                              ),
                            })
                          }
                        />
                      </label>
                      <button
                        type="button"
                        className="text-button"
                        onClick={() =>
                          change({
                            ...content,
                            collocations: content.collocations.filter(
                              (_, j) => j !== i,
                            ),
                          })
                        }
                      >
                        Xóa cụm {i + 1}
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="soft-button"
                    disabled={content.collocations.length >= 8}
                    onClick={() =>
                      change({
                        ...content,
                        collocations: [
                          ...content.collocations,
                          { ko: "", vi: "" },
                        ],
                      })
                    }
                  >
                    Thêm cụm kết hợp
                  </button>
                  <h3>Ví dụ Hàn–Việt</h3>
                  {content.examples.map((example, i) => (
                    <div className="catalog-repeat" key={i}>
                      <label>
                        Câu tiếng Hàn {i + 1}
                        <textarea
                          className="control-input"
                          required
                          lang="ko"
                          maxLength={1000}
                          value={example.ko}
                          onChange={(e) =>
                            change({
                              ...content,
                              examples: content.examples.map((x, j) =>
                                j === i ? { ...x, ko: e.target.value } : x,
                              ),
                            })
                          }
                        />
                      </label>
                      <label>
                        Dịch Việt {i + 1}
                        <textarea
                          className="control-input"
                          required
                          maxLength={1000}
                          value={example.vi}
                          onChange={(e) =>
                            change({
                              ...content,
                              examples: content.examples.map((x, j) =>
                                j === i ? { ...x, vi: e.target.value } : x,
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
                            ...content,
                            examples: content.examples.filter(
                              (_, j) => j !== i,
                            ),
                          })
                        }
                      >
                        Xóa ví dụ {i + 1}
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="soft-button"
                    disabled={content.examples.length >= 6}
                    onClick={() =>
                      change({
                        ...content,
                        examples: [...content.examples, { ko: "", vi: "" }],
                      })
                    }
                  >
                    Thêm ví dụ
                  </button>
                </>
              ) : (
                <>
                  <label>
                    Tên bộ
                    <input
                      className="control-input"
                      required
                      maxLength={200}
                      value={content.title}
                      onChange={(e) =>
                        change({ ...content, title: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Mô tả và tình huống học
                    <textarea
                      className="control-input"
                      required
                      maxLength={1000}
                      value={content.summary}
                      onChange={(e) =>
                        change({ ...content, summary: e.target.value })
                      }
                    />
                  </label>
                  <h3>Nghĩa và phiên bản trong bộ</h3>
                  {content.senses.map((s, i) => (
                    <div className="catalog-repeat" key={s.key}>
                      <p>
                        {i + 1}. {labels[`${s.key}:${s.revision}`] || s.key} · v
                        {s.revision}
                      </p>
                      <button
                        type="button"
                        className="text-button"
                        onClick={() =>
                          change({
                            ...content,
                            senses: content.senses.filter((_, j) => j !== i),
                          })
                        }
                      >
                        Gỡ mục {i + 1}
                      </button>
                    </div>
                  ))}
                  <label>
                    Tìm nghĩa đã xuất bản
                    <input
                      className="control-input"
                      maxLength={200}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    className="soft-button"
                    onClick={() => void findChoices()}
                  >
                    Tìm nghĩa
                  </button>
                  {choices.map((c) => (
                    <div className="catalog-repeat" key={c.key}>
                      <p>
                        {c.title} — {c.meaning} · v{c.revision}
                      </p>
                      <button
                        type="button"
                        className="text-button"
                        disabled={
                          content.senses.some((s) => s.key === c.key) ||
                          content.senses.length >= 100
                        }
                        onClick={() =>
                          change({
                            ...content,
                            senses: [
                              ...content.senses,
                              { key: c.key, revision: c.revision },
                            ],
                          })
                        }
                      >
                        Thêm {c.title} vào bộ
                      </button>
                    </div>
                  ))}
                  <div className="task-actions">
                    <button
                      type="button"
                      className="soft-button"
                      disabled={!choiceOffset}
                      onClick={() =>
                        void findChoices(Math.max(0, choiceOffset - 30))
                      }
                    >
                      Nghĩa trước
                    </button>
                    <span>{choicesTotal} kết quả</span>
                    <button
                      type="button"
                      className="soft-button"
                      disabled={choiceOffset + 30 >= choicesTotal}
                      onClick={() => void findChoices(choiceOffset + 30)}
                    >
                      Nghĩa sau
                    </button>
                  </div>
                </>
              )}
              <label>
                Nguồn / người biên soạn
                <textarea
                  className="control-input"
                  required
                  maxLength={1000}
                  value={content.source}
                  onChange={(e) =>
                    change({ ...content, source: e.target.value })
                  }
                />
              </label>
              <label>
                Quyền sử dụng / ghi công
                <textarea
                  className="control-input"
                  required
                  maxLength={1000}
                  value={content.rights}
                  onChange={(e) =>
                    change({ ...content, rights: e.target.value })
                  }
                />
              </label>
            </fieldset>
            {editable && (
              <button className="primary-button spaced" disabled={busy}>
                {selected ? "Lưu bản nháp" : "Tạo bản nháp"}
              </button>
            )}
          </form>
          {selected?.status === "draft" && (
            <>
              <label className="catalog-review">
                <input
                  type="checkbox"
                  disabled={busy || dirty}
                  checked={reviewConfirmed}
                  onChange={(e) => setReviewConfirmed(e.target.checked)}
                />{" "}
                Tôi đã kiểm nghĩa, ví dụ, tham chiếu và quyền sử dụng
              </label>
              <button
                className="soft-button"
                disabled={busy || dirty || !reviewConfirmed}
                onClick={() => void transition("review")}
              >
                Xác nhận đã duyệt
              </button>
            </>
          )}
          {selected?.status === "reviewed" && (
            <div className="task-actions spaced">
              <button
                className="primary-button"
                disabled={busy}
                onClick={() => void transition("publish")}
              >
                Xuất bản
              </button>
              <button
                className="soft-button"
                disabled={busy}
                onClick={() => void transition("revise")}
              >
                Trả về nháp
              </button>
            </div>
          )}
          {selected?.status === "published" && (
            <button
              className="soft-button spaced"
              disabled={busy}
              onClick={() => void transition("fork")}
            >
              Tạo phiên bản mới
            </button>
          )}
          <p className="muted small">
            Bản đã xuất bản không sửa trực tiếp. Thay đổi nghĩa không cập nhật
            âm thầm thẻ SRS hoặc bộ đã pin revision cũ.
          </p>
        </section>
      </div>
    </main>
  );
}
