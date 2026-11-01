"use client";
import { useEffect, useRef, useState } from "react";
import { publicEntry, gradeKnowledge, type KnowledgeContent } from "@everlang/contracts/knowledge-contract";
import type { CatalogContent } from "@everlang/contracts/vocabulary-catalog-contract";
import type { z } from "zod";
import type { sentenceEditorialSchema } from "@everlang/contracts/editorial";
import { KnowledgeSections } from "./knowledge-sections";
import { request } from "@/lib/client";
import "@/app/knowledge/knowledge.css";

export type EditorialItem = {
  _id?: string; key?: string; revision?: number; editVersion?: number; contentVersion?: number;
  status: string; content?: KnowledgeContent | CatalogContent;
} & Partial<z.infer<typeof sentenceEditorialSchema>>;
export const itemTitle = (item: EditorialItem) => item.content ? ("title" in item.content ? item.content.title : item.content.term) : item.viText || "Bài luyện";
export const itemIdentity = (item: EditorialItem) => item.key ? `${item.key}:${item.revision}` : item._id!;

export function StudentPreview({ item, endpoint, onClose, onPublished }: { item: EditorialItem; endpoint: string; onClose: () => void; onPublished: (item: EditorialItem) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ReturnType<typeof gradeKnowledge> | null>(null);
  const [refs, setRefs] = useState<{ key: string; revision: number; title: string; meaning: string }[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const content = item.content;
  const knowledge = content && "sections" in content ? content : null;
  const student = knowledge ? publicEntry({ ...knowledge, key: item.key!, revision: item.revision!, editVersion: item.editVersion!, status: item.status as "draft" | "reviewed" | "published" }) : null;
  useEffect(() => {
    const el = dialog.current!;
    const invoker = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    el.showModal();
    return () => { el.close(); queueMicrotask(() => { if (invoker?.isConnected) invoker.focus(); }); };
  }, []);
  useEffect(() => {
    let active = true;
    if (content?.kind === "set") request<{ references: typeof refs }>(`${endpoint}?key=${encodeURIComponent(item.key!)}&revision=${item.revision}`).then(p => { if (active) setRefs(p.references); }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  // Snapshot stays fixed for the lifetime of this dialog.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <dialog ref={dialog} className="editorial-preview" aria-labelledby="student-preview-title" onCancel={onClose}>
    <div className="section-heading"><div><p className="eyebrow">XEM TRƯỚC · HỌC VIÊN</p><h2 id="student-preview-title">{itemTitle(item)}</h2></div><button className="soft-button" onClick={onClose} disabled={busy}>Đóng preview</button></div>
    <p className="muted">Bản đã lưu · {item.key || item._id} · v{item.revision || item.contentVersion}. Thử bài tại đây không ghi tiến độ, điểm hoặc SRS.</p>
    <article className="panel knowledge-reading">
      {student ? <><p>{student.level} · {student.topic}</p><p>{student.summary}</p><KnowledgeSections content={student} />
        {student.questions.length > 0 && <form onSubmit={e => { e.preventDefault(); setResult(gradeKnowledge(knowledge!, answers)); }}><h3>Thử dùng kiến thức</h3>{student.questions.map(q => <fieldset key={q.id} disabled={Boolean(result)}><legend>{q.prompt}</legend>{q.type === "choice" ? q.options.map(o => <label className="knowledge-option" key={o}><input type="radio" required name={q.id} value={o} onChange={() => setAnswers(a => ({ ...a, [q.id]: o }))} />{o}</label>) : <label>Câu trả lời<input required value={answers[q.id] || ""} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))} /></label>}</fieldset>)}<button className="primary-button" disabled={Boolean(result)}>Kiểm tra thử · không lưu</button></form>}
        {result?.map(r => <section key={r.id}><strong>{r.correct ? "Đúng" : "Cần ôn thêm"}</strong><p>Đáp án: {r.answer}</p><p>{r.explanation}</p></section>)}</> : content?.kind === "sense" ? <><h3 lang="ko">{content.term}</h3><p>{content.pos} · {content.pronunciation} · {content.hanja} · {content.register}</p><button className="soft-button" onClick={() => setRevealed(v => !v)}>{revealed ? "Ẩn nghĩa" : "Hiện nghĩa"}</button>{revealed && <><p>{content.meaning}</p><p>{content.usage}</p>{content.examples.map((x, i) => <div className="knowledge-example" key={i}><p lang="ko">{x.ko}</p><p>{x.vi}</p></div>)}</>}</> : content?.kind === "set" ? <><p>{content.summary}</p><h3>Nghĩa được ghim trong bộ</h3>{refs.length ? refs.map(r => <p key={`${r.key}:${r.revision}`}><strong lang="ko">{r.title}</strong> — {r.meaning} <small>v{r.revision}</small></p>) : <p role="status">Đang tải nghĩa theo phiên bản…</p>}</> : <><h3>Dịch sang tiếng Hàn</h3><p>{item.viText}</p><label>Bản dịch của bạn<textarea /></label><button className="soft-button" onClick={() => setRevealed(v => !v)}>{revealed ? "Ẩn đáp án tham khảo" : "Xem đáp án tham khảo"}</button>{revealed && <><p lang="ko">{item.koSampleAnswer}</p><p>{item.keyGrammar?.join(" · ")}</p><p>{item.keyVocab?.join(" · ")}</p></>}</>}
      <footer className="muted small"><p>Nguồn: {content?.source || item.source}</p><p>Quyền sử dụng: {content?.rights || item.rights}</p></footer>
    </article>
    {error && <p role="alert">{error}</p>}
    <div className="task-actions spaced"><button className="soft-button" onClick={onClose} disabled={busy}>Hủy · giữ nguyên trạng thái</button>{item.status === "reviewed" && <button className="primary-button" disabled={busy || Boolean(error) || (content?.kind === "set" && refs.length !== content.senses.length)} onClick={async () => {
      setBusy(true); setError("");
      try { const response = await request<{ item: EditorialItem }>(endpoint, "PATCH", item.key ? { key: item.key, revision: item.revision, editVersion: item.editVersion, action: "publish" } : { id: item._id, version: item.contentVersion, action: "publish" }); onPublished(response.item); onClose(); }
      catch (e) { setError((e as Error).message); } finally { setBusy(false); }
    }}>{busy ? "Đang xuất bản…" : "Xác nhận xuất bản bản này"}</button>}</div>
  </dialog>;
}

