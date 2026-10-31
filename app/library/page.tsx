"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { DictionarySelectionLookup } from "@/components/practice";
import { readingLessons } from "@/data/reading-lessons";
import { request, speak } from "@/lib/client";
export default function Library() {
  const [index, setIndex] = useState(0);
  const [tab, setTab] = useState<"read" | "listen" | "speak" | "tutor">("read");
  const [transcript, setTranscript] = useState(false);
  const [dictation, setDictation] = useState("");
  const [checked, setChecked] = useState(false);
  const [notice, setNotice] = useState("");
  const [recording, setRecording] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [speech, setSpeech] = useState<{
    transcript: string;
    feedback: {
      comment: string;
      suggestions: { original: string; suggested: string; reason: string }[];
    };
  } | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lesson = readingLessons[index];
  const [answer, setAnswer] = useState<{
    answer: string;
    hints: string[];
    sources: { id: string; excerpt: string }[];
  } | null>(null);
  const [question, setQuestion] = useState("");
  useEffect(
    () => () => {
      recorder.current?.stream.getTracks().forEach((t) => t.stop());
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    if (!blob) return;
    const u = URL.createObjectURL(blob);
    const timer = setTimeout(() => setUrl(u), 0);
    return () => {
      clearTimeout(timer);
      URL.revokeObjectURL(u);
    };
  }, [blob]);
  async function record() {
    setNotice("");
    if (recording) {
      recorder.current?.stop();
      return;
    }
    try {
      if (!MediaRecorder.isTypeSupported("audio/webm;codecs=opus"))
        throw new Error(
          "Trình duyệt chưa hỗ trợ ghi âm WebM Opus. Hãy dùng Chrome hoặc Edge.",
        );
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 48000 },
      });
      const m = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      recorder.current = m;
      const chunks: BlobPart[] = [];
      m.ondataavailable = (e) => chunks.push(e.data);
      m.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setBlob(new Blob(chunks, { type: "audio/webm" }));
        setRecording(false);
        if (timer.current) clearTimeout(timer.current);
      };
      m.start();
      setRecording(true);
      setSpeech(null);
      timer.current = setTimeout(() => m.stop(), 55000);
    } catch (e) {
      setNotice((e as Error).message);
    }
  }
  async function send() {
    if (!blob) return;
    setBusy(true);
    try {
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let binary = "";
      for (const n of bytes) binary += String.fromCharCode(n);
      setSpeech(
        await request("/api/recordings", "POST", {
          audio: btoa(binary),
          consent,
        }),
      );
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="page">
      <DictionarySelectionLookup />
      <p className="eyebrow">ĐƯA TIẾNG HÀN VÀO NGỮ CẢNH</p>
      <h1 className="page-title">Nghe, đọc và diễn đạt</h1>
      <p><Link href="/knowledge" className="text-button">Thư viện ngữ pháp, quán dụng ngữ và tài liệu đọc lại →</Link></p>
      <p className="muted">
        Học liệu tự biên soạn dành cho beta. Audio mẫu dùng giọng đọc của trình
        duyệt.
      </p>
      <div className="task-actions spaced">
        {[
          ["read", "Đọc hiểu"],
          ["listen", "Nghe & chép chính tả"],
          ["speak", "Thu âm & shadowing"],
          ["tutor", "Trợ giảng AI"],
        ].map(([t, label]) => (
          <button
            key={t}
            className={tab === t ? "primary-button" : "soft-button"}
            onClick={() => setTab(t as typeof tab)}
          >
            {label}
          </button>
        ))}
      </div>
      {notice && <p className="notice">{notice}</p>}
      {tab === "tutor" ? (
        <section className="panel spaced">
          <h2>Hiểu cách làm, trước khi xem đáp án</h2>
          <form
            className="form-stack"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                setAnswer(
                  await request("/api/tutor", "POST", {
                    question,
                    reveal: false,
                  }),
                );
              } catch (e) {
                setNotice((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <label>
              Câu hỏi của bạn
              <textarea
                required
                maxLength={2000}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </label>
            <button disabled={busy} className="primary-button">
              {busy ? "Đang tìm trong học liệu…" : "Nhận gợi ý"}
            </button>
          </form>
          {answer && (
            <div className="spaced">
              <p style={{ whiteSpace: "pre-wrap" }}>{answer.answer}</p>
              {answer.hints.map((h, i) => (
                <p key={i}>• {h}</p>
              ))}
              <button
                className="soft-button spaced"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    setAnswer(
                      await request("/api/tutor", "POST", {
                        question,
                        reveal: true,
                      }),
                    );
                  } catch (e) {
                    setNotice((e as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Xem giải thích đầy đủ
              </button>
              <h3 className="spaced">Học liệu tham chiếu</h3>
              {answer.sources.map((s) => (
                <p className="muted small" key={s.id}>
                  {s.excerpt}
                </p>
              ))}
            </div>
          )}
        </section>
      ) : (
        <div className="dashboard-grid spaced">
          <aside className="panel">
            <h2>Chọn bài học</h2>
            {readingLessons.map((l, i) => (
              <button
                className="vocab-row full"
                key={l.id}
                onClick={() => {
                  setIndex(i);
                  setChecked(false);
                  setDictation("");
                  setTranscript(false);
                }}
              >
                <span>
                  {l.title}
                  <small className="muted block">
                    {l.topic} · {l.level}
                  </small>
                </span>
                <span>{index === i ? "●" : "→"}</span>
              </button>
            ))}
            <p className="muted small spaced">{lesson.source}</p>
          </aside>
          <section className="panel">
            <h2>{lesson.title}</h2>
            {tab === "read" ? (
              lesson.segments.map((s, i) => (
                <article className="spaced" key={i}>
                  <p
                    className="kr-font text-lg leading-8"
                    onMouseUp={() => {
                      const selection = window
                        .getSelection()
                        ?.toString()
                        .trim();
                      if (selection && selection.length < 100)
                        setNotice(
                          "Đã chọn: " +
                            selection +
                            ". Bấm Lưu cụm từ bên dưới và điền nghĩa để ôn.",
                        );
                    }}
                  >
                    {s.ko}
                  </p>
                  <details className="small muted">
                    <summary>Xem nghĩa tiếng Việt</summary>
                    {s.vi}
                  </details>
                  <div className="task-actions">
                    <button onClick={() => speak(s.ko)}>Nghe câu</button>
                    <Link
                      href={
                        "/vocabulary?term=" +
                        encodeURIComponent(s.ko) +
                        "&meaning=" +
                        encodeURIComponent(s.vi) +
                        "&kind=phrase"
                      }
                    >
                      Lưu cụm từ →
                    </Link>
                    <a
                      href={
                        "https://krdict.korean.go.kr/vie/dicSearch/search?nation=vie&mainSearchWord=" +
                        encodeURIComponent(s.ko)
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      Tra từ điển ↗
                    </a>
                  </div>
                </article>
              ))
            ) : tab === "listen" ? (
              <>
                <button
                  className="primary-button"
                  onClick={() => speak(lesson.segments[0].ko)}
                >
                  Nghe câu đầu tiên
                </button>
                <p className="muted spaced">
                  Nghe lại, ghi câu bạn nghe được, rồi so sánh.
                </p>
                <textarea
                  aria-label="Chép chính tả"
                  className="kr-input"
                  value={dictation}
                  onChange={(e) => setDictation(e.target.value)}
                />
                <div className="task-actions">
                  <button
                    className="soft-button"
                    onClick={() => setChecked(true)}
                  >
                    So sánh bản chép
                  </button>
                  <button
                    className="soft-button"
                    onClick={() => setTranscript(!transcript)}
                  >
                    {transcript ? "Ẩn" : "Hiện"} transcript
                  </button>
                </div>
                {checked && (
                  <div className="notice">
                    <p>Bạn viết: {dictation}</p>
                    <p>Tham khảo: {lesson.segments[0].ko}</p>
                    <p>
                      {dictation.replace(/[\p{P}\s]/gu, "") ===
                      lesson.segments[0].ko.replace(/[\p{P}\s]/gu, "")
                        ? "Khớp nội dung."
                        : "Hãy nghe lại và đối chiếu các từ khác biệt."}
                    </p>
                  </div>
                )}
                {transcript &&
                  lesson.segments.map((s, i) => (
                    <p className="spaced" key={i}>
                      {s.ko}
                    </p>
                  ))}
              </>
            ) : (
              <>
                <p>
                  Nghe câu mẫu, đọc theo và thu âm tối đa 55 giây. Bạn có thể
                  nghe lại ngay trên thiết bị.
                </p>
                <div className="task-actions">
                  <button
                    className="soft-button"
                    onClick={() => speak(lesson.segments[0].ko)}
                  >
                    Nghe mẫu
                  </button>
                  <button
                    className="primary-button"
                    onClick={() => void record()}
                  >
                    {recording ? "Dừng ghi âm" : "Bắt đầu ghi âm"}
                  </button>
                </div>
                {url && <audio className="spaced full" controls src={url} />}
                <label className="small block spaced">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />{" "}
                  Tôi đồng ý gửi bản ghi đến Google Speech, transcript đến nhà
                  cung cấp AI qua OpenRouter và lưu bản ghi riêng tư để nhận góp
                  ý.
                </label>
                <button
                  disabled={!blob || !consent || busy || recording}
                  className="primary-button spaced"
                  onClick={() => void send()}
                >
                  {busy ? "Đang xử lý…" : "Chuyển thành văn bản & góp ý"}
                </button>
                <p className="muted small">
                  Góp ý tập trung vào nội dung/cách diễn đạt; chưa chấm điểm
                  phát âm.
                </p>
                {speech && (
                  <div className="notice">
                    <p>{speech.transcript}</p>
                    <p>{speech.feedback.comment}</p>
                    {speech.feedback.suggestions.map((s, i) => (
                      <p key={i}>
                        {s.original} → {s.suggested}: {s.reason}
                      </p>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
