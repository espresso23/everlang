"use client";
import { useCallback, useEffect, useState } from "react";
import { knowledgeKey, knowledgeSchema } from "@everlang/contracts/knowledge-contract";
import { catalogKey, catalogContentSchema } from "@everlang/contracts/vocabulary-catalog-contract";
import { sentenceEditorialSchema } from "@everlang/contracts/editorial";
import { z } from "zod";
import { request } from "@/lib/client";
import { itemIdentity, itemTitle, StudentPreview, type EditorialItem } from "./editorial-preview";
import "./editorial.css";

const labels: Record<string, string> = { draft: "Nháp", reviewed: "Đã duyệt", published: "Đã xuất bản" };
type Query = { q: string; status: string; level: string; topic: string; sort: string; limit: number; offset: number };
const initial: Query = { q: "", status: "", level: "", topic: "", sort: "updated", limit: 25, offset: 0 };
type Outcome = { id: string; ok: boolean; message: string };
export function EditorialDesk({ endpoint, kind = "", onSelect, refreshToken }: { endpoint: string; kind?: string; onSelect: (item: EditorialItem) => void | boolean; refreshToken?: unknown }) {
  const [activeId, setActiveId] = useState("");
  const [query, setQuery] = useState<Query>(initial);
  const [ready, setReady] = useState(false);
  const [rows, setRows] = useState<EditorialItem[]>([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<EditorialItem[]>([]);
  const [preview, setPreview] = useState<EditorialItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<Outcome[]>([]);
  const [source, setSource] = useState("");
  const [rights, setRights] = useState("");
  const [raw, setRaw] = useState("");
  const [importRows, setImportRows] = useState<unknown[] | null>(null);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    function restore() {
      const params = new URLSearchParams(location.search);
      const next = { ...initial };
      for (const key of ["q", "status", "level", "topic", "sort"] as const) next[key] = params.get(key) || initial[key];
      next.limit = [25, 50, 100].includes(Number(params.get("limit"))) ? Number(params.get("limit")) : 25;
      next.offset = Math.max(0, Math.min(1000000, Number(params.get("offset")) || 0));
      setQuery(next); setSelected([]); setReady(true);
    }
    restore(); window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);
  function update(patch: Partial<Query>) {
    const next = { ...query, offset: 0, ...patch };
    setQuery(next); setSelected([]); setResults([]); setLoading(true);
    const params = new URLSearchParams(location.search);
    Object.entries(next).forEach(([k, v]) => { if (v === "" || v === 0) params.delete(k); else params.set(k, String(v)); });
    history.replaceState(null, "", `${location.pathname}?${params}`);
  }
  const reload = useCallback(() => setVersion(n => n + 1), []);
  useEffect(() => {
    if (!ready) return;
    let active = true;
    const params = new URLSearchParams(Object.entries(query).map(([k, v]) => [k, String(v)]));
    if (kind) params.set("kind", kind);
    const timer = setTimeout(() => {
      setLoading(true); setError("");
      request<{ items: EditorialItem[]; total: number }>(`${endpoint}?${params}`).then(p => { if (active) { setRows(p.items); setTotal(p.total); } }).catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); });
    }, 180);
    return () => { active = false; clearTimeout(timer); };
  }, [endpoint, kind, query, ready, version, refreshToken]);
  function open(item: EditorialItem) { if (onSelect(item) !== false) setActiveId(itemIdentity(item)); }
  const activeIndex = rows.findIndex(row => itemIdentity(row) === activeId);
  async function batch() {
    setBusy(true); setError(""); const output: Outcome[] = []; const failed: EditorialItem[] = [];
    for (const row of selected) {
      try {
        if (row.status !== "draft") throw new Error("Chỉ cập nhật metadata của bản nháp.");
        const changes = { ...(source.trim() ? { source: source.trim() } : {}), ...(rights.trim() ? { rights: rights.trim() } : {}) };
        await request(endpoint, "PATCH", row.key ? { key: row.key, revision: row.revision, editVersion: row.editVersion, action: "edit", content: { ...row.content, ...changes } } : { id: row._id, version: row.contentVersion, action: "edit", content: sentenceEditorialSchema.parse({ topic: row.topic, level: row.level, viText: row.viText, koSampleAnswer: row.koSampleAnswer, keyGrammar: row.keyGrammar, keyVocab: row.keyVocab, source: row.source, rights: row.rights, ...changes }) });
        output.push({ id: itemIdentity(row), ok: true, message: "Đã lưu metadata" });
      } catch (e) { failed.push(row); output.push({ id: itemIdentity(row), ok: false, message: (e as Error).message }); }
    }
    setResults(output); setSelected(failed); setBusy(false); reload();
  }
  function dryRun() {
    setImportRows(null); setResults([]); setError("");
    try {
      if (raw.length > 1000000) throw new Error("Tệp JSON tối đa 1 MB.");
      const parsed: unknown = JSON.parse(raw);
      const list = z.array(z.unknown()).min(1).max(50).parse(parsed);
      const schema = endpoint.endsWith("knowledge") ? z.object({ key: knowledgeKey, content: knowledgeSchema }).strict() : endpoint.endsWith("word-sets") ? z.object({ key: catalogKey, content: catalogContentSchema }).strict() : sentenceEditorialSchema;
      const output: Outcome[] = []; const valid: unknown[] = []; const keys = new Set<string>();
      list.forEach((row, i) => {
        const result = schema.safeParse(row);
        if (!result.success) output.push({ id: `Dòng ${i + 1}`, ok: false, message: result.error.issues.map(e => `${e.path.join(".")}: ${e.message}`).join("; ") });
        else {
          const key = "key" in result.data ? String(result.data.key) : "";
          if (key && keys.has(key)) output.push({ id: `Dòng ${i + 1}`, ok: false, message: "Mã bị trùng trong tệp" });
          else { if (key) keys.add(key); valid.push(result.data); output.push({ id: `Dòng ${i + 1}`, ok: true, message: "Hợp lệ · sẽ tạo nháp" }); }
        }
      });
      setResults(output); if (output.every(x => x.ok)) setImportRows(valid);
    } catch (e) { setError((e as Error).message); }
  }
  async function importDrafts() {
    if (!importRows || !window.confirm(`Tạo ${importRows.length} bản nháp? Không tự duyệt hoặc xuất bản.`)) return;
    setBusy(true); const output: Outcome[] = []; const failed: unknown[] = [];
    for (const [i, row] of importRows.entries()) {
      try {
        const digest = endpoint.endsWith("content") ? Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(row))))).map(n => n.toString(16).padStart(2, "0")).join("") : "";
        const response = await request<{duplicate?:boolean}>(endpoint, "POST", digest ? { ...(row as object), importKey: digest } : row);
        output.push({ id: `Dòng ${i + 1}`, ok: true, message: response.duplicate ? "Nháp đã có · không tạo trùng" : "Đã tạo nháp" });
      }
      catch (e) { failed.push(row); output.push({ id: `Dòng ${i + 1}`, ok: false, message: (e as Error).message }); }
    }
    setImportRows(failed.length ? failed : null); setResults(output); setBusy(false); reload();
  }
  return <section className="panel editorial-desk" aria-label="Kho học liệu biên tập">
    <div className="section-heading"><h2>Kho học liệu</h2><button className="soft-button" disabled={busy || loading} onClick={reload}>Tải lại danh sách</button></div>
    <div className="editorial-filters"><label>Tìm học liệu<input value={query.q} onChange={e => update({ q: e.target.value })} /></label><label>Trạng thái<select value={query.status} onChange={e => update({ status: e.target.value })}><option value="">Tất cả</option>{Object.entries(labels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label><label>Trình độ<input value={query.level} placeholder="Lọc đúng trình độ" onChange={e => update({ level: e.target.value })} /></label><label>Chủ đề<input value={query.topic} placeholder="Lọc đúng chủ đề" onChange={e => update({ topic: e.target.value })} /></label><label>Sắp xếp<select value={query.sort} onChange={e => update({ sort: e.target.value })}><option value="updated">Cập nhật mới nhất</option><option value="title">Tiêu đề A–Z</option></select></label><label>Số mục/trang<select value={query.limit} onChange={e => update({ limit: Number(e.target.value) })}>{[25, 50, 100].map(n => <option key={n}>{n}</option>)}</select></label></div>
    <div className="task-actions"><button className="text-button" disabled={busy} onClick={() => update({ status: "draft" })}>Nháp cần xử lý</button><button className="text-button" disabled={busy} onClick={() => update({ status: "reviewed" })}>Đã duyệt · chờ xuất bản</button><button className="text-button" disabled={busy} onClick={() => update(initial)}>Bỏ bộ lọc</button></div>
    {error && <p role="alert">{error} <button onClick={reload}>Thử lại</button></p>}{loading && <p role="status">Đang tải học liệu…</p>}
    <div className="editorial-table-wrap"><table className="editorial-table"><thead><tr><th>Chọn nháp</th><th>Học liệu</th><th>Trạng thái</th><th>Phiên bản</th><th>Thao tác</th></tr></thead><tbody>{rows.map(row => <tr key={itemIdentity(row)}><td><input type="checkbox" aria-label={`Chọn ${itemTitle(row)}`} disabled={busy || loading || row.status !== "draft"} checked={selected.some(x => itemIdentity(x) === itemIdentity(row))} onChange={e => setSelected(prev => e.target.checked ? [...prev, structuredClone(row)] : prev.filter(x => itemIdentity(x) !== itemIdentity(row)))} /></td><td><strong>{itemTitle(row)}</strong><small>{row.key || row._id}</small></td><td>{labels[row.status]}</td><td>v{row.revision || row.contentVersion}</td><td><div className="task-actions"><button className="soft-button" disabled={busy || loading} onClick={() => open(row)}>Mở biên tập</button><button className="soft-button" disabled={busy || loading} onClick={() => setPreview(structuredClone(row))}>{row.status === "reviewed" ? "Preview & xuất bản" : "Preview student"}</button></div></td></tr>)}</tbody></table></div>
    {!loading && !error && rows.length === 0 && <p>Không có học liệu khớp bộ lọc.</p>}
    <div className="task-actions"><button className="soft-button" disabled={busy || loading || query.offset === 0} onClick={() => update({ offset: Math.max(0, query.offset - query.limit) })}>Trang trước</button><span aria-live="polite">{total ? `${Math.min(query.offset + 1, total)}–${Math.min(query.offset + rows.length, total)}` : "0"} / {total} phiên bản</span><button className="soft-button" disabled={busy || loading || query.offset + query.limit >= total} onClick={() => update({ offset: query.offset + query.limit })}>Trang sau</button></div>
    {activeIndex >= 0 && <div className="task-actions"><span>Đang biên tập: {itemTitle(rows[activeIndex])}</span><button className="soft-button" disabled={busy || loading || activeIndex === 0} onClick={() => open(rows[activeIndex - 1])}>Biên tập mục trước</button><button className="soft-button" disabled={busy || loading || activeIndex + 1 >= rows.length} onClick={() => open(rows[activeIndex + 1])}>Biên tập mục tiếp theo</button></div>}
    <details><summary>Cập nhật nguồn/quyền cho các nháp đã chọn ({selected.length})</summary><p>Chỉ áp dụng trường có nhập. Phiên bản thay đổi đồng thời sẽ báo lỗi riêng, không ghi đè.</p><label>Nguồn hàng loạt<input maxLength={500} value={source} onChange={e => setSource(e.target.value)} /></label><label>Quyền sử dụng hàng loạt<input maxLength={1000} value={rights} onChange={e => setRights(e.target.value)} /></label><button className="primary-button" disabled={busy || !selected.length || (!source.trim() && !rights.trim())} onClick={() => { if (window.confirm(`Cập nhật ${selected.length} nháp đã chọn?`)) void batch(); }}>Cập nhật nháp đã chọn</button><p>Chỉ những mục thất bại còn được chọn. Lỗi xung đột cần tải bản mới và chọn lại.</p></details>
    <details><summary>Nhập nháp hàng loạt · JSON</summary><p>Tối đa 50 mục. {endpoint.endsWith("content") ? "Mảng các bài luyện với topic, level, viText, koSampleAnswer, keyGrammar, keyVocab, source, rights." : "Mảng {key, content} theo schema hiện có; không nhận status/reviewer từ tệp."} Nhập nháp không tự duyệt nội dung.</p><label>JSON bản nháp<textarea rows={6} value={raw} onChange={e => { setRaw(e.target.value); setImportRows(null); setResults([]); }} /></label><div className="task-actions"><button className="soft-button" disabled={busy || !raw.trim()} onClick={dryRun}>Kiểm tra trước khi nhập</button><button className="primary-button" disabled={busy || !importRows?.length} onClick={() => void importDrafts()}>Nhập {importRows?.length || 0} nháp đã kiểm tra</button></div></details>
    {results.length > 0 && <div role="status"><h3>Kết quả từng mục</h3><ul>{results.map((r, i) => <li key={`${r.id}:${i}`}>{r.ok ? "✓" : "!"} {r.id}: {r.message}</li>)}</ul></div>}
    {preview && <StudentPreview key={itemIdentity(preview)} item={preview} endpoint={endpoint} onClose={() => setPreview(null)} onPublished={() => { setSelected([]); reload(); }} />}
  </section>;
}
