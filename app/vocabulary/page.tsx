"use client";
import Link from "next/link";
import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { request } from "@/lib/client";
import { playKorean, stopKorean } from "@/lib/korean-audio";
import {
  catalogRecallContext,
  type CatalogSnapshot,
} from "@/lib/vocabulary-catalog-contract";
type Card = {
  id: string;
  term: string;
  meaning: string;
  context: string;
  content_snapshot?: CatalogSnapshot | null;
  note: string;
  kind: string;
  version: number;
  suspended: boolean;
  due: string;
};
function Vocabulary() {
  const params = useSearchParams();
  const [items, setItems] = useState<Card[]>([]);
  const [due, setDue] = useState(0);
  const [now, setNow] = useState(0);
  const [review, setReview] = useState(params.get("review") === "true");
  const [revealed, setRevealed] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [audioBusy, setAudioBusy] = useState(false);
  const [editing, setEditing] = useState<Card | null>(null);
  const load = useCallback(async () => {
    try {
      const p = await request<{ items: Card[]; dueCount: number }>(
        "/api/vocabulary",
      );
      setItems(p.items);
      setDue(p.dueCount);
      setNow(Date.now());
    } catch (e) {
      setMessage((e as Error).message);
    }
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => {
      clearTimeout(timer);
      stopKorean();
    };
  }, [load]);
  const active = items.find(
    (c) => !c.suspended && new Date(c.due).getTime() <= now,
  );
  async function listen(text: string) {
    setAudioBusy(true);
    setMessage("");
    try {
      await playKorean(text);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setAudioBusy(false);
    }
  }
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const form = e.currentTarget;
    try {
      const p = await request<{ duplicate?: boolean }>(
        "/api/vocabulary",
        editing ? "PUT" : "POST",
        {
          term: f.get("term"),
          meaning: f.get("meaning"),
          context: f.get("context"),
          note: f.get("note"),
          kind: f.get("kind"),
          ...(editing
            ? {
                id: editing.id,
                version: editing.version,
                suspended: editing.suspended,
              }
            : {}),
        },
      );
      setMessage(
        p.duplicate ? "Từ này đã có trong kho." : "Đã lưu vào kho từ.",
      );
      setEditing(null);
      form.reset();
      await load();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function rate(rating: number) {
    if (!active) return;
    stopKorean();
    setBusy(true);
    try {
      await request("/api/reviews", "POST", {
        id: active.id,
        version: active.version,
        rating,
        requestId: crypto.randomUUID(),
      });
      setRevealed(false);
      await load();
    } catch (e) {
      setMessage((e as Error).message);
      await load();
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">GHI NHỚ TỪ TRONG NGỮ CẢNH</p>
          <h1 className="page-title">Kho từ & ôn tập</h1>
          <p className="muted">
            {due} thẻ đến hạn · Lịch ôn thích ứng với cách bạn ghi nhớ.
          </p>
        </div>
        <button
          className="primary-button"
          onClick={() => {
            stopKorean();
            setReview(!review);
            setRevealed(false);
          }}
        >
          {review ? "Xem kho từ" : `Bắt đầu ôn (${due})`}
        </button>
      </div>
      <p>
        <Link href="/word-sets" className="text-button">
          Khám phá bộ từ theo chủ đề →
        </Link>
      </p>
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      {review ? (
        <section className="panel review-card">
          {active ? (
            <>
              <p className="eyebrow">
                {active.kind === "grammar" ? "NGỮ PHÁP" : "BẠN CÒN NHỚ KHÔNG?"}
              </p>
              <h2 lang="ko">{active.term}</h2>
              <button
                className="soft-button"
                disabled={audioBusy}
                onClick={() => void listen(active.term)}
              >
                Nghe phát âm
              </button>
              {active.context && (
                <p style={{ whiteSpace: "pre-line" }}>
                  {catalogRecallContext(
                    active.context,
                    active.content_snapshot,
                    revealed,
                  )}
                </p>
              )}
              {revealed ? (
                <>
                  <div className="review-answer">
                    <h3>{active.meaning}</h3>
                    <p>{active.note}</p>
                  </div>
                  <p className="muted">Bạn nhớ từ này ở mức nào?</p>
                  <div className="rating-buttons">
                    {[
                      "Again · Quên",
                      "Hard · Khó",
                      "Good · Nhớ",
                      "Easy · Dễ",
                    ].map((v, i) => (
                      <button
                        key={v}
                        disabled={busy}
                        onClick={() => void rate(i + 1)}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <button
                  className="primary-button"
                  onClick={() => setRevealed(true)}
                >
                  Hiện nghĩa
                </button>
              )}
            </>
          ) : (
            <>
              <h2>Đã ôn hết thẻ đến hạn ✦</h2>
              <p className="muted">
                Bạn có thể thêm từ mới hoặc quay lại luyện dịch.
              </p>
            </>
          )}
        </section>
      ) : (
        <div className="dashboard-grid">
          <section className="panel">
            <h2>{editing ? "Sửa thẻ" : "Thêm kiến thức mới"}</h2>
            <form
              key={editing?.id || "new"}
              className="form-stack"
              onSubmit={save}
            >
              <label>
                Từ / cụm từ / mẫu ngữ pháp
                <input
                  required
                  name="term"
                  maxLength={200}
                  defaultValue={editing?.term || params.get("term") || ""}
                />
              </label>
              <label>
                Nghĩa hoặc cách dùng
                <textarea
                  required
                  name="meaning"
                  maxLength={1000}
                  defaultValue={editing?.meaning || params.get("meaning") || ""}
                />
              </label>
              <label>
                Loại
                <select
                  name="kind"
                  defaultValue={editing?.kind || params.get("kind") || "word"}
                >
                  <option value="word">Từ vựng</option>
                  <option value="phrase">Cụm từ</option>
                  <option value="grammar">Ngữ pháp</option>
                </select>
              </label>
              <label>
                Câu ngữ cảnh
                <textarea
                  name="context"
                  maxLength={2000}
                  defaultValue={editing?.context || ""}
                />
              </label>
              <label>
                Ghi chú
                <textarea
                  name="note"
                  maxLength={2000}
                  defaultValue={editing?.note || ""}
                />
              </label>
              <button className="primary-button" disabled={busy}>
                Lưu thẻ
              </button>
              {editing && (
                <button
                  type="button"
                  className="soft-button"
                  onClick={() => setEditing(null)}
                >
                  Hủy sửa
                </button>
              )}
            </form>
          </section>
          <section className="panel">
            <h2>
              Kiến thức đã lưu <span className="tag">{items.length}</span>
            </h2>
            {!items.length && (
              <p className="muted">
                Thêm thẻ đầu tiên hoặc lưu một cụm từ từ kết quả chấm bài.
              </p>
            )}
            {items.map((c) => (
              <article className="vocab-row" key={c.id}>
                <div>
                  <h3>{c.term}</h3>
                  <p>{c.meaning}</p>
                  <small>
                    {c.suspended
                      ? "Đã tạm dừng"
                      : `Ôn: ${new Date(c.due).toLocaleString("vi-VN")}`}
                  </small>
                </div>
                <div className="row-actions">
                  <button
                    disabled={audioBusy}
                    onClick={() => void listen(c.term)}
                    aria-label={"Nghe " + c.term}
                  >
                    ♫
                  </button>
                  <button onClick={() => setEditing(c)}>Sửa</button>
                  <button
                    onClick={async () => {
                      try {
                        await request("/api/vocabulary", "PUT", {
                          ...c,
                          sourceId: undefined,
                          suspended: !c.suspended,
                        });
                        await load();
                      } catch (e) {
                        setMessage((e as Error).message);
                      }
                    }}
                  >
                    {c.suspended ? "Tiếp tục" : "Tạm dừng"}
                  </button>
                </div>
              </article>
            ))}
          </section>
        </div>
      )}
    </main>
  );
}
export default function Page() {
  return (
    <Suspense fallback={<p className="page">Đang tải…</p>}>
      <Vocabulary />
    </Suspense>
  );
}
