"use client";
import { useCallback, useEffect, useState, useRef } from "react";
import { request } from "@/lib/client";
type Q = {
  id: string;
  skill: string;
  prompt: string;
  options: string[];
  points: number;
  answer?: string;
  explanation?: string;
  audioUrl?: string;
};
type Attempt = {
  id: string;
  version: number;
  deadline: string;
  submitted_at: string | null;
  snapshot: { title: string; kind: string; questions: Q[] };
  answers: Record<string, string>;
  result: {
    objectiveScore: number;
    objectiveMax: number;
    writingStatus: string;
    writing?: { id: string; score: number; comment: string }[];
  } | null;
};
export default function Exams() {
  const [list, setList] = useState<{
    items: { id: string; title: string; kind: string; minutes: number }[];
    attempts: { id: string; submitted_at: string | null }[];
  }>({ items: [], attempts: [] });
  const [a, setA] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const current = useRef(a);
  const pending = useRef(answers);
  const dirty = useRef(false);
  const saving = useRef(false);
  useEffect(() => {
    current.current = a;
  }, [a]);
  useEffect(() => {
    pending.current = answers;
  }, [answers]);
  const loadList = useCallback(
    () =>
      request<typeof list>("/api/exams")
        .then(setList)
        .catch((e) => setNotice(e.message)),
    [],
  );
  useEffect(() => {
    void loadList();
  }, [loadList]);
  const open = useCallback(async (id: string) => {
    try {
      const p = await request<Attempt>("/api/exams?attempt=" + id);
      setA(p);
      setAnswers(p.answers);
      current.current = p;
      pending.current = p.answers;
      dirty.current = false;
    } catch (e) {
      setNotice((e as Error).message);
    }
  }, []);
  const save = useCallback(async (submit = false) => {
    const c = current.current;
    if (!c || c.submitted_at || saving.current) return;
    saving.current = true;
    const sent = { ...pending.current };
    try {
      await request("/api/exams", "PATCH", {
        id: c.id,
        version: c.version,
        answers: sent,
        submit,
      });
      const p = await request<Attempt>("/api/exams?attempt=" + c.id);
      setA(p);
      current.current = p;
      if (submit || p.submitted_at) {
        setAnswers(p.answers);
        pending.current = p.answers;
      }
      dirty.current = JSON.stringify(sent) !== JSON.stringify(pending.current);
    } catch (e) {
      setNotice((e as Error).message);
      dirty.current = false;
    } finally {
      saving.current = false;
    }
  }, []);
  useEffect(() => {
    const timer = setInterval(() => {
      const c = current.current;
      if (!c) return;
      const left = Math.max(
        0,
        Math.ceil((new Date(c.deadline).getTime() - Date.now()) / 1000),
      );
      setRemaining(left);
      if (!c.submitted_at && (dirty.current || left === 0))
        void save(left === 0);
      if (c.submitted_at && c.result?.writingStatus === "queued")
        request<Attempt>("/api/exams?attempt=" + c.id)
          .then((p) => {
            setA(p);
            current.current = p;
          })
          .catch(() => {});
    }, 3000);
    return () => clearInterval(timer);
  }, [save]);
  return (
    <main className="page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">LUYỆN THI SAU KHI VỮNG NỀN TẢNG</p>
          <h1 className="page-title">TOPIK II · Luyện tập</h1>
          <p className="muted">
            Điểm luyện tập, không phải kết quả chứng chỉ chính thức. Bản beta có
            bài luyện ngắn; đề đầy đủ cần học liệu được duyệt.
          </p>
        </div>
        {a && (
          <button
            className="soft-button"
            onClick={() => {
              setA(null);
              current.current = null;
              void loadList();
            }}
          >
            Danh sách đề
          </button>
        )}
      </div>
      {notice && <p className="notice">{notice}</p>}
      {!a ? (
        <div className="dashboard-grid">
          <section className="panel">
            <h2>Đề có thể luyện</h2>
            {list.items.map((e) => (
              <article className="vocab-row" key={e.id}>
                <div>
                  <h3>{e.title}</h3>
                  <p className="muted">
                    {e.kind === "mini"
                      ? "Bài luyện ngắn · tự biên soạn"
                      : "Đề đủ cấu trúc PBT"}{" "}
                    · {e.minutes} phút
                  </p>
                </div>
                <button
                  disabled={busy}
                  className="primary-button"
                  onClick={async () => {
                    setBusy(true);
                    try {
                      const p = await request<{ id: string }>(
                        "/api/exams",
                        "POST",
                        { examId: e.id },
                      );
                      await open(p.id);
                    } catch (e) {
                      setNotice((e as Error).message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Bắt đầu / tiếp tục
                </button>
              </article>
            ))}
          </section>
          <section className="panel">
            <h2>Lịch sử lượt thi</h2>
            {list.attempts.map((t) => (
              <button
                className="vocab-row full"
                key={t.id}
                onClick={() => void open(t.id)}
              >
                {t.submitted_at ? "Xem kết quả" : "Tiếp tục bài đang làm"} →
              </button>
            ))}
          </section>
        </div>
      ) : (
        <section className="panel">
          <div className="section-heading">
            <h2>{a.snapshot.title}</h2>
            <span className="tag yellow">
              {a.submitted_at
                ? "Đã nộp"
                : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`}
            </span>
          </div>
          {a.result && (
            <div className="notice">
              <strong>
                Nghe/Đọc: {a.result.objectiveScore}/{a.result.objectiveMax}
              </strong>
              <p>
                Viết:{" "}
                {a.result.writingStatus === "queued"
                  ? "AI đang chấm…"
                  : a.result.writingStatus === "failed"
                    ? "Chưa chấm được; bài làm đã được lưu."
                    : a.result.writingStatus === "none"
                      ? "Đề không có phần viết"
                      : "Đã chấm luyện tập"}
              </p>
              {a.result.writing?.map((w) => (
                <p key={w.id}>
                  {w.score} điểm · {w.comment}
                </p>
              ))}
            </div>
          )}
          {a.snapshot.questions.map((q, i) => (
            <article className="spaced" key={q.id}>
              <h3>
                {i + 1}. {q.prompt}
              </h3>
              <p className="muted small">
                {q.skill} · {q.points} điểm
              </p>
              {q.audioUrl && <audio controls src={q.audioUrl} />}{" "}
              {q.skill === "writing" ? (
                <textarea
                  className="kr-input"
                  aria-label={"Câu " + (i + 1)}
                  disabled={Boolean(a.submitted_at)}
                  value={answers[q.id] || ""}
                  maxLength={10000}
                  onChange={(e) => {
                    setAnswers((v) => ({ ...v, [q.id]: e.target.value }));
                    pending.current = {
                      ...pending.current,
                      [q.id]: e.target.value,
                    };
                    dirty.current = true;
                  }}
                />
              ) : (
                <div className="form-stack">
                  {q.options.map((o) => (
                    <label
                      key={o}
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <input
                        style={{ width: 18, minHeight: 18 }}
                        type="radio"
                        name={q.id}
                        disabled={Boolean(a.submitted_at)}
                        checked={answers[q.id] === o}
                        onChange={() => {
                          setAnswers((v) => ({ ...v, [q.id]: o }));
                          pending.current = { ...pending.current, [q.id]: o };
                          dirty.current = true;
                        }}
                      />
                      {o}
                    </label>
                  ))}
                </div>
              )}
              {a.submitted_at && (
                <p className="success-note">
                  Tham khảo: {q.answer}
                  <br />
                  {q.explanation}
                </p>
              )}
            </article>
          ))}
          {!a.submitted_at && (
            <button
              className="primary-button spaced"
              disabled={busy}
              onClick={async () => {
                if (!window.confirm("Nộp bài và kết thúc lượt thi này?"))
                  return;
                setBusy(true);
                await save(true);
                setBusy(false);
              }}
            >
              Nộp bài
            </button>
          )}
        </section>
      )}
    </main>
  );
}
