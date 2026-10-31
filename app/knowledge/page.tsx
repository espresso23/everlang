"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { request, speak } from "@/lib/client";
import {
  knowledgeKinds,
  knowledgeLabels,
  type PublicKnowledge,
} from "@/lib/knowledge-contract";
import "./knowledge.css";

type Summary = Pick<
  PublicKnowledge,
  "key" | "revision" | "title" | "kind" | "level" | "topic" | "summary"
>;
type State = {
  revision: number;
  version: number;
  bookmarked: boolean;
  note: string;
  section: string;
  read: boolean;
};
type Feedback = {
  id: string;
  correct: boolean;
  answer: string;
  explanation: string;
};
const emptyState: State = {
  revision: 0,
  version: 0,
  bookmarked: false,
  note: "",
  section: "",
  read: false,
};

function Reader({ entryKey, back }: { entryKey: string; back: string }) {
  const [entry, setEntry] = useState<PublicKnowledge | null>(null);
  const [state, setState] = useState<State>(emptyState);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Feedback[] | null>(null);
  const [attemptId, setAttemptId] = useState("");
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    let live = true;
    Promise.all([
      request<{ item: PublicKnowledge }>(
        "/api/knowledge?key=" + encodeURIComponent(entryKey),
      ),
      request<{ state: State | null }>(
        "/api/knowledge/state?key=" + encodeURIComponent(entryKey),
      ),
    ])
      .then(([content, progress]) => {
        if (!live) return;
        setEntry(content.item);
        setState(progress.state || emptyState);
        setError("");
      })
      .catch((e) => {
        if (live) setError(e.message);
      });
    return () => {
      live = false;
    };
  }, [entryKey, retry]);
  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);
  if (error)
    return (
      <section className="panel">
        <p role="alert">{error}</p>
        <button className="soft-button" onClick={() => setRetry((n) => n + 1)}>
          Thử tải lại
        </button>
        <Link href={back}>Về thư viện</Link>
      </section>
    );
  if (!entry) return <p role="status">Đang mở tài liệu và ghi chú…</p>;
  const content = entry;
  function edit(patch: Partial<State>) {
    setState((s) => ({ ...s, ...patch }));
    setDirty(true);
  }
  function play(text: string) {
    if (
      !("speechSynthesis" in window) ||
      !window.speechSynthesis
        .getVoices()
        .some((v) => v.lang.toLowerCase().startsWith("ko"))
    ) {
      setNotice(
        "Thiết bị chưa có giọng TTS tiếng Hàn. Bạn vẫn có thể đọc và làm bài; thử lại sau khi cài giọng tiếng Hàn.",
      );
      return;
    }
    speak(text);
  }
  async function save() {
    setBusy(true);
    setNotice("");
    try {
      const response = await request<{ state: State }>(
        "/api/knowledge/state",
        "PUT",
        {
          key: content.key,
          revision: content.revision,
          version: state.version,
          bookmarked: state.bookmarked,
          note: state.note,
          section: content.sections.some((s) => s.id === state.section)
            ? state.section
            : "",
          read: state.read,
        },
      );
      setState(response.state);
      setDirty(false);
      setNotice("Đã lưu ghi chú và vị trí đọc.");
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function reloadState() {
    if (
      dirty &&
      !window.confirm(
        "Thay bản bạn đang sửa bằng bản mới từ tài khoản? Hãy sao chép ghi chú nếu cần đối chiếu.",
      )
    )
      return;
    setBusy(true);
    try {
      const p = await request<{ state: State | null }>(
        "/api/knowledge/state?key=" + encodeURIComponent(entryKey),
      );
      setState(p.state || emptyState);
      setDirty(false);
      setNotice("Đã tải bản mới nhất.");
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    const id = attemptId || crypto.randomUUID();
    setAttemptId(id);
    try {
      const p = await request<{ result: Feedback[] }>(
        "/api/knowledge/attempts",
        "POST",
        {
          key: content.key,
          revision: content.revision,
          answers,
          requestId: id,
        },
      );
      setResult(p.result);
      setNotice(
        "Đã lưu kết quả luyện tập. Đọc bài không tự đánh dấu thành thạo.",
      );
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function saveCard() {
    setBusy(true);
    try {
      const p = await request<{ duplicate: boolean }>(
        "/api/vocabulary",
        "POST",
        {
          term: content.title,
          meaning: content.summary,
          context: content.examples[0].ko,
          kind: content.kind === "grammar" ? "grammar" : "phrase",
          sourceId: `knowledge:${content.key}:v${content.revision}`,
        },
      );
      setNotice(
        p.duplicate
          ? "Mẫu này đã có trong SRS; lịch ôn cũ được giữ nguyên."
          : "Đã lưu mẫu vào kho ôn SRS.",
      );
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Link
        href={back}
        onClick={(e) => {
          if (dirty && !window.confirm("Ghi chú chưa lưu. Rời bài?"))
            e.preventDefault();
        }}
      >
        ← Về thư viện
      </Link>
      <header className="knowledge-heading">
        <p className="eyebrow">
          {knowledgeLabels[content.kind]} · {content.level} · {content.topic}
        </p>
        <h1 className="knowledge-title" lang="ko">
          {content.title}
        </h1>
        <p className="learning-text">{content.summary}</p>
        <span className="muted small">
          Phiên bản {content.revision} · Audio dùng TTS của thiết bị
        </span>
      </header>
      <div className="knowledge-layout">
        <article className="panel knowledge-reading">
          <nav aria-label="Mục lục bài">
            <strong>Trong bài này</strong>
            <ul>
              {content.sections.map((s) => (
                <li key={s.id}>
                  <a href={"#" + s.id}>{s.heading}</a>
                </li>
              ))}
            </ul>
          </nav>
          {content.sections.map((s) => (
            <section id={s.id} key={s.id} tabIndex={-1}>
              <h2>{s.heading}</h2>
              <p className="learning-text">{s.text}</p>
              <button
                className="text-button"
                disabled={busy}
                onClick={() => {
                  edit({ section: s.id });
                  setNotice("Đã chọn vị trí này; bấm Lưu ghi chú để đồng bộ.");
                }}
              >
                Ghi nhớ vị trí này
              </button>
            </section>
          ))}
          <section>
            <h2>Ví dụ trong ngữ cảnh</h2>
            {content.examples.map((example, i) => (
              <div className="knowledge-example" key={i}>
                <p className="learning-text" lang="ko">
                  {example.ko}
                </p>
                <p>{example.vi}</p>
                <button
                  className="soft-button"
                  onClick={() => play(example.ko)}
                >
                  Nghe câu · TTS
                </button>
              </div>
            ))}
          </section>
          {content.questions.length > 0 && (
            <section>
              <h2>Thử dùng kiến thức</h2>
              <form onSubmit={submit}>
                {content.questions.map((q) => (
                  <fieldset key={q.id} disabled={busy || Boolean(result)}>
                    <legend>{q.prompt}</legend>
                    {q.type === "choice" ? (
                      q.options.map((option) => (
                        <label className="knowledge-option" key={option}>
                          <input
                            required
                            type="radio"
                            name={q.id}
                            value={option}
                            checked={answers[q.id] === option}
                            onChange={() => {
                              setAnswers((a) => ({ ...a, [q.id]: option }));
                              setAttemptId("");
                            }}
                          />
                          {option}
                        </label>
                      ))
                    ) : (
                      <label>
                        Câu trả lời
                        <input
                          className="control-input"
                          required
                          maxLength={500}
                          value={answers[q.id] || ""}
                          onChange={(e) => {
                            setAnswers((a) => ({
                              ...a,
                              [q.id]: e.target.value,
                            }));
                            setAttemptId("");
                          }}
                        />
                      </label>
                    )}
                  </fieldset>
                ))}
                {!result && (
                  <button
                    className="primary-button"
                    disabled={busy}
                    type="submit"
                  >
                    {busy ? "Đang lưu…" : "Kiểm tra và lưu kết quả"}
                  </button>
                )}
              </form>
              {result && (
                <div aria-live="polite">
                  {result.map((f) => (
                    <div className="knowledge-example" key={f.id}>
                      <strong>{f.correct ? "Đúng" : "Cần ôn thêm"}</strong>
                      <p>Đáp án: {f.answer}</p>
                      <p>{f.explanation}</p>
                    </div>
                  ))}
                  <button
                    className="soft-button"
                    onClick={() => {
                      setAnswers({});
                      setAttemptId("");
                      setResult(null);
                    }}
                  >
                    Luyện lại
                  </button>
                </div>
              )}
            </section>
          )}
          <footer className="muted small">
            Nguồn: {content.source}
            <br />
            Quyền sử dụng: {content.rights}
          </footer>
        </article>
        <aside className="panel knowledge-notes">
          <h2>Sổ đọc của bạn</h2>
          {state.revision > 0 && state.revision !== content.revision && (
            <p className="notice">
              Ghi chú thuộc phiên bản {state.revision}. Hãy kiểm tra nội dung
              trước khi lưu sang bản mới.
            </p>
          )}
          <label className="knowledge-option">
            <input
              type="checkbox"
              disabled={busy}
              checked={state.bookmarked}
              onChange={(e) => edit({ bookmarked: e.target.checked })}
            />
            Đánh dấu đọc lại
          </label>
          <label className="knowledge-option">
            <input
              type="checkbox"
              disabled={busy}
              checked={state.read}
              onChange={(e) => edit({ read: e.target.checked })}
            />
            Đã đọc phiên bản này
          </label>
          <label>
            Ghi chú riêng
            <textarea
              className="control-input"
              rows={7}
              maxLength={6000}
              disabled={busy}
              value={state.note}
              onChange={(e) => edit({ note: e.target.value })}
            />
          </label>
          <label>
            Vị trí đọc
            <select
              className="control-input"
              disabled={busy}
              value={
                content.sections.some((s) => s.id === state.section)
                  ? state.section
                  : ""
              }
              onChange={(e) => edit({ section: e.target.value })}
            >
              <option value="">Đầu bài</option>
              {content.sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.heading}
                </option>
              ))}
            </select>
          </label>
          <a
            href={
              "#" +
              (content.sections.some((s) => s.id === state.section)
                ? state.section
                : content.sections[0].id)
            }
          >
            Đến vị trí đang đọc
          </a>
          <button
            className="primary-button"
            disabled={busy || !dirty}
            onClick={save}
          >
            Lưu ghi chú
          </button>
          <button className="soft-button" disabled={busy} onClick={reloadState}>
            Tải ghi chú mới nhất
          </button>
          <button className="soft-button" disabled={busy} onClick={saveCard}>
            Lưu mẫu vào SRS
          </button>
          <Link href="/vocabulary">Mở kho ôn tập →</Link>
          <p className="muted small">
            Ghi chú chỉ thuộc tài khoản của bạn. Đã đọc chưa đồng nghĩa đã thành
            thạo.
          </p>
          {content.relatedItems.length > 0 && (
            <nav aria-label="Tài liệu liên quan">
              <h3>Đọc tiếp</h3>
              {content.relatedItems.map((related) => (
                <Link
                  key={related.key}
                  href={`/knowledge?key=${encodeURIComponent(related.key)}`}
                  onClick={(e) => {
                    if (dirty && !window.confirm("Ghi chú chưa lưu. Rời bài?"))
                      e.preventDefault();
                  }}
                >
                  {related.title} →
                </Link>
              ))}
            </nav>
          )}
        </aside>
      </div>
      <p className="notice" role="status" aria-live="polite">
        {notice || (dirty ? "Có thay đổi chưa lưu." : "")}
      </p>
    </>
  );
}

function KnowledgeBrowser() {
  const params = useSearchParams();
  const router = useRouter();
  const key = params.get("key");
  const query = new URLSearchParams(params.toString());
  query.delete("key");
  const queryString = query.toString();
  const [items, setItems] = useState<Summary[] | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [saved, setSaved] = useState<
    { entry_key: string; title: string; bookmarked: boolean; section: string }[]
  >([]);
  const [savedError, setSavedError] = useState("");
  useEffect(() => {
    if (key) return;
    let live = true;
    request<{ items: typeof saved }>("/api/knowledge/state")
      .then((p) => {
        if (live) {
          setSaved(p.items);
          setSavedError("");
        }
      })
      .catch((e) => {
        if (live) setSavedError(e.message);
      });
    return () => {
      live = false;
    };
  }, [key, retry]);
  useEffect(() => {
    if (key) return;
    let live = true;
    request<{ items: Summary[] }>("/api/knowledge?" + queryString)
      .then((p) => {
        if (live) {
          setItems(p.items);
          setError("");
        }
      })
      .catch((e) => {
        if (live) setError(e.message);
      });
    return () => {
      live = false;
    };
  }, [key, queryString, retry]);
  return (
    <main className="page knowledge-page">
      {key ? (
        <Reader key={key} entryKey={key} back={"/knowledge?" + queryString} />
      ) : (
        <>
          <p className="eyebrow">ĐỌC ĐỂ HIỂU · DÙNG ĐỂ NHỚ</p>
          <h1 className="page-title">Thư viện kiến thức</h1>
          <p className="muted">
            Ngữ pháp, quán dụng ngữ và tài liệu đã được duyệt. Đọc lại, ghi chú
            và nối kiến thức vào luyện tập.
          </p>
          {savedError && (
            <p role="alert">
              Không tải được sổ đọc: {savedError}{" "}
              <button
                className="text-button"
                onClick={() => setRetry((n) => n + 1)}
              >
                Thử lại sổ đọc
              </button>
            </p>
          )}
          {saved.length > 0 && (
            <details className="panel">
              <summary>Sổ đọc của bạn · {saved.length} tài liệu</summary>
              <ul>
                {saved.map((item) => (
                  <li key={item.entry_key}>
                    <Link
                      href={`/knowledge?key=${encodeURIComponent(item.entry_key)}`}
                    >
                      {item.title || "Tài liệu đã lưu"}
                    </Link>{" "}
                    · {item.bookmarked ? "Đã đánh dấu" : "Đọc tiếp"}
                  </li>
                ))}
              </ul>
            </details>
          )}
          <form
            className="panel knowledge-filters"
            key={queryString}
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              const next = new URLSearchParams();
              for (const [k, v] of data)
                if (String(v).trim()) next.set(k, String(v).trim());
              setItems(null);
              router.push("/knowledge?" + next.toString());
            }}
          >
            <label>
              Từ khóa Hàn–Việt
              <input
                className="control-input"
                name="q"
                maxLength={120}
                defaultValue={params.get("q") || ""}
              />
            </label>
            <label>
              Loại tài liệu
              <select
                className="control-input"
                name="kind"
                defaultValue={params.get("kind") || ""}
              >
                <option value="">Tất cả</option>
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
                name="level"
                defaultValue={params.get("level") || ""}
              >
                <option value="">Tất cả</option>
                {["Sơ cấp", "Trung cấp", "Cao cấp"].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </label>
            <label>
              Chủ đề
              <input
                className="control-input"
                name="topic"
                maxLength={120}
                defaultValue={params.get("topic") || ""}
              />
            </label>
            <button className="primary-button">Tìm tài liệu</button>
          </form>
          {error ? (
            <div role="alert" className="panel">
              <p>{error}</p>
              <button
                className="soft-button"
                onClick={() => setRetry((n) => n + 1)}
              >
                Thử lại
              </button>
            </div>
          ) : !items ? (
            <p role="status">Đang tìm tài liệu…</p>
          ) : !items.length ? (
            <div className="panel">
              <h2>Chưa có tài liệu phù hợp</h2>
              <p>
                Đổi bộ lọc hoặc trở lại sau khi học liệu được duyệt và xuất bản.
              </p>
              <Link href="/library">Tiếp tục nghe–đọc–nói →</Link>
            </div>
          ) : (
            <>
              <p className="muted small">
                Hiển thị tối đa 100 tài liệu; thu hẹp bộ lọc để tìm chính xác.
              </p>
              <div className="knowledge-cards">
                {items.map((item) => (
                  <article className="panel" key={item.key}>
                    <p className="eyebrow">
                      {knowledgeLabels[item.kind]} · {item.level}
                    </p>
                    <h2 className="knowledge-title" lang="ko">
                      {item.title}
                    </h2>
                    <p>{item.summary}</p>
                    <p className="muted small">{item.topic}</p>
                    <Link
                      className="text-button"
                      href={`/knowledge?${queryString ? queryString + "&" : ""}key=${encodeURIComponent(item.key)}`}
                    >
                      Đọc và luyện tập →
                    </Link>
                  </article>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </main>
  );
}
export default function KnowledgePage() {
  return (
    <Suspense
      fallback={
        <main className="page" role="status">
          Đang mở thư viện…
        </main>
      }
    >
      <KnowledgeBrowser />
    </Suspense>
  );
}
