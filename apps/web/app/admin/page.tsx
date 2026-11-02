"use client";
import { useConfirmation } from "@/components/confirmation";
import { EditorialDesk } from "@/components/editorial-desk";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { request } from "@/lib/client";
import { TOPICS, LEVELS } from "@everlang/contracts/types";
type Content = {
  _id: string;
  viText: string;
  koSampleAnswer: string;
  status: string;
  contentVersion: number;
  topic: string;
  level: string;
  source: string;
  rights: string;
  keyGrammar: string[];
  keyVocab: string[];
};
export default function Admin() {
  const confirm = useConfirmation();
  const [items, setItems] = useState<Content[]>([]);
  const [message, setMessage] = useState("");
  const [edit, setEdit] = useState<Content | null>(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(
    () =>
      request<{ items: Content[] }>("/api/admin/content")
        .then((p) => setItems(p.items))
        .catch((e) => setMessage(e.message)),
    [],
  );
  useEffect(() => {
    void load();
  }, [load]);
  return (
    <main className="page">
      <p className="eyebrow">QUẢN TRỊ EVERLANG</p>
      <h1 className="page-title">Học liệu có kiểm duyệt</h1>
      <p><Link href="/admin/word-sets" className="text-button">Biên soạn bộ từ & nghĩa →</Link></p>
      <p><Link className="text-button" href="/admin/knowledge">Biên tập thư viện ngữ pháp, quán dụng ngữ và tài liệu →</Link></p>
      <p className="muted">
        Nháp → Đã duyệt → Xuất bản. Bài đã xuất bản được giữ bất biến để bảo
        toàn lịch sử.
      </p>
      {message && <p className="notice">{message}</p>}
      <EditorialDesk endpoint="/api/admin/content" refreshToken={items} onSelect={async row => { if (edit && !(await confirm({ message: "Mở bài khác? Hãy lưu thay đổi hiện tại trước.", confirmLabel: "Mở bài khác" }))) return false; setEdit(row as Content); return true; }} />
      <div className="dashboard-grid">
        <section className="panel">
          <h2>{edit ? "Sửa bản nháp" : "Biên soạn bài mới"}</h2>
          <form
            key={edit?._id || "new"}
            className="form-stack"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              const f = new FormData(e.currentTarget);
              const content = {
                topic: f.get("topic"),
                level: f.get("level"),
                viText: f.get("viText"),
                koSampleAnswer: f.get("koSampleAnswer"),
                source: f.get("source"),
                rights: f.get("rights"),
                keyGrammar: String(f.get("keyGrammar"))
                  .split("\n")
                  .filter(Boolean),
                keyVocab: String(f.get("keyVocab")).split("\n").filter(Boolean),
              };
              try {
                await request(
                  "/api/admin/content",
                  edit ? "PATCH" : "POST",
                  edit
                    ? {
                        id: edit._id,
                        version: edit.contentVersion,
                        action: "edit",
                        content,
                      }
                    : content,
                );
                setEdit(null);
                setMessage("Đã lưu nháp.");
                await load();
              } catch (e) {
                setMessage((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <label>
              Chủ đề
              <select name="topic" defaultValue={edit?.topic}>
                {TOPICS.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label>
              Trình độ
              <select name="level" defaultValue={edit?.level}>
                {LEVELS.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            {[
              ["viText", "Đề tiếng Việt", edit?.viText],
              ["koSampleAnswer", "Đáp án tham khảo", edit?.koSampleAnswer],
              [
                "keyGrammar",
                "Ngữ pháp (mỗi dòng một mục)",
                edit?.keyGrammar.join("\n"),
              ],
              [
                "keyVocab",
                "Từ vựng (mỗi dòng một mục)",
                edit?.keyVocab.join("\n"),
              ],
              ["source", "Nguồn", edit?.source],
              ["rights", "Quyền sử dụng / xác nhận biên soạn", edit?.rights],
            ].map(([name, label, value]) => (
              <label key={name}>
                {label}
                <textarea
                  name={name}
                  defaultValue={value}
                  required={!name?.startsWith("key")}
                />
              </label>
            ))}
            <button className="primary-button" disabled={busy}>
              Lưu bản nháp
            </button>
            {edit && (
              <button
                type="button"
                className="soft-button"
                onClick={() => setEdit(null)}
              >
                Hủy sửa
              </button>
            )}
          </form>
          <button
            disabled={busy}
            className="soft-button spaced"
            onClick={async () => {
              setBusy(true);
              try {
                await request("/api/admin/content", "POST", {
                  generate: true,
                  topic: TOPICS[0],
                  level: "TOPIK 5",
                });
                await load();
              } catch (e) {
                setMessage((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            AI hỗ trợ tạo 5 bản nháp
          </button>
        </section>
        <aside className="panel"><h2>Biên tập và xuất bản</h2><p>Chọn học liệu ở bảng phía trên để sửa. Sau khi lưu, mở Preview student để kiểm tra nội dung và xuất bản đúng phiên bản đã duyệt.</p>{edit && <button className="soft-button" onClick={() => setEdit(null)}>Đóng biên tập</button>}</aside>
      </div>
      <AdvancedTools onMessage={setMessage} />
    </main>
  );
}

function AdvancedTools({ onMessage }: { onMessage: (s: string) => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <section className="panel spaced">
      <h2>Công cụ mở rộng</h2>
      <p className="muted">
        Chỉ mục trợ giảng chỉ lấy bài đã xuất bản. Tạo embedding có sử dụng dịch
        vụ AI.
      </p>
      <button
        disabled={busy}
        className="soft-button spaced"
        onClick={async () => {
          setBusy(true);
          try {
            const p = await request<{ indexed: number }>(
              "/api/tutor",
              "PUT",
              {},
            );
            onMessage(`Đã lập chỉ mục ${p.indexed} bài.`);
          } catch (e) {
            onMessage((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        Lập chỉ mục học liệu cho AI Tutor
      </button>
      <h3 className="spaced">Nhập đề TOPIK II PBT</h3>
      <p className="muted small">
        JSON theo schema trong lib/exams.ts. Chỉ nhập đề có quyền sử dụng; mini
        và full được ghi nhãn riêng.
      </p>
      <form
        className="form-stack spaced"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            const raw = String(new FormData(e.currentTarget).get("exam"));
            await request("/api/exams", "PUT", JSON.parse(raw));
            onMessage("Đã xuất bản đề đã kiểm duyệt.");
          } catch (e) {
            onMessage((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          JSON đề đã duyệt
          <textarea name="exam" required rows={7} />
        </label>
        <button className="primary-button" disabled={busy}>
          Nhập đề đã duyệt
        </button>
      </form>
    </section>
  );
}
