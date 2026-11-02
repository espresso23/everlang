"use client";
import { useConfirmation } from "@/components/confirmation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PrivateAudio } from "@/components/private-audio";
import { request } from "@/lib/client";
import type { SpeechAttemptView } from "@everlang/contracts/speech";
import "./speech.css";

type Item = SpeechAttemptView;
type Capabilities = {
  configured: boolean;
  provider: "whispercpp" | "gemini" | null;
  externalProcessing: boolean;
  consentVersion: string;
  workerOnline: boolean;
  maxSeconds: number;
  maxBytes: number;
  pronunciationAssessment: boolean;
};
const labels: Record<Item["status"], string> = {
  staging: "Đang lưu bản ghi",
  queued: "Đang chờ xử lý",
  active: "Đang nhận dạng",
  completed: "Đã nhận dạng",
  failed: "Cần thử lại",
  deleted: "Đang hoàn tất xóa file",
};
function SpeechSession() {
  const confirm = useConfirmation();
  const params = useSearchParams();
  const [reference, setReference] = useState(
    (params.get("reference") || "").slice(0, 300),
  );
  const [capabilities, setCapabilities] = useState<Capabilities | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState("");
  const [recording, setRecording] = useState(false);
  const [requestingMic, setRequestingMic] = useState(false);
  const acquiringMic = useRef(false);
  const [seconds, setSeconds] = useState(0);
  const [consent, setConsent] = useState("");
  const [busy, setBusy] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clock = useRef<ReturnType<typeof setInterval> | null>(null);
  const requestId = useRef("");
  const alive = useRef(true);
  const generation = useRef({ value: 0 });
  const load = useCallback(async () => {
    const seq = ++generation.current.value;
    try {
      const p = await request<{ capabilities: Capabilities; items: Item[] }>(
        "/api/speech",
      );
      if (alive.current && seq === generation.current.value) {
        setCapabilities(p.capabilities);
        setItems(p.items);
        setError("");
      }
    } catch (e) {
      if (alive.current && seq === generation.current.value)
        setError((e as Error).message);
    }
  }, []);
  useEffect(() => {
    alive.current = true;
    const fence = generation.current;
    const initial = setTimeout(() => {
      void load();
    }, 0);
    const poll = setInterval(() => {
      if (!document.hidden) void load();
    }, 4000);
    return () => {
      alive.current = false;
      fence.value++;
      clearInterval(poll);
      clearTimeout(initial);
      if (stopTimer.current) clearTimeout(stopTimer.current);
      if (clock.current) clearInterval(clock.current);
      if (recorder.current?.state === "recording") recorder.current.stop();
      recorder.current?.stream.getTracks().forEach((t) => t.stop());
    };
  }, [load]);
  useEffect(() => {
    if (!blob) return;
    const value = URL.createObjectURL(blob);
    const timer = setTimeout(() => setUrl(value), 0);
    return () => {
      clearTimeout(timer);
      URL.revokeObjectURL(value);
    };
  }, [blob]);
  async function toggleRecord() {
    if (recording) {
      recorder.current?.stop();
      return;
    }
    if (acquiringMic.current) return;
    acquiringMic.current = true;
    setRequestingMic(true);
    setNotice("");
    try {
      if (
        !navigator.mediaDevices?.getUserMedia ||
        typeof MediaRecorder === "undefined"
      )
        throw new Error(
          "Thiết bị chưa hỗ trợ thu âm ở trang này. Bạn có thể nhập một file audio.",
        );
      const mime = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find(
        (type) => MediaRecorder.isTypeSupported(type),
      );
      if (!mime)
        throw new Error(
          "Chưa có định dạng ghi âm phù hợp. Hãy nhập WAV, WebM hoặc M4A.",
        );
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!alive.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      let media: MediaRecorder;
      try {
        media = new MediaRecorder(stream, { mimeType: mime });
      } catch (e) {
        stream.getTracks().forEach((t) => t.stop());
        throw e;
      }
      recorder.current = media;
      const chunks: BlobPart[] = [];
      const start = Date.now();
      media.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      media.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (stopTimer.current) clearTimeout(stopTimer.current);
        if (clock.current) clearInterval(clock.current);
        if (alive.current) {
          setBlob(new Blob(chunks, { type: mime.split(";")[0] }));
          setRecording(false);
          requestId.current = "";
          setConsent("");
        }
      };
      media.onerror = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (stopTimer.current) clearTimeout(stopTimer.current);
        if (clock.current) clearInterval(clock.current);
        if (alive.current) {
          setRecording(false);
          setNotice("Thu âm bị gián đoạn. Thử lại hoặc nhập file audio.");
        }
      };
      media.start();
      setRecording(true);
      setSeconds(0);
      clock.current = setInterval(() => {
        if (alive.current)
          setSeconds(Math.min(20, Math.floor((Date.now() - start) / 1000)));
      }, 300);
      stopTimer.current = setTimeout(() => {
        if (media.state === "recording") media.stop();
      }, 20000);
    } catch (e) {
      if (alive.current)
        setNotice((e as Error).message || "Chưa có quyền microphone.");
    } finally {
      acquiringMic.current = false;
      if (alive.current) setRequestingMic(false);
    }
  }
  async function send() {
    if (!blob) return;
    setBusy(true);
    setNotice("");
    try {
      if (blob.size > (capabilities?.maxBytes || 3000000))
        throw new Error(
          "File lớn hơn 3MB. Hãy thu hoặc nhập một đoạn ngắn hơn.",
        );
      const bytes = new Uint8Array(await blob.arrayBuffer());
      const pieces = [];
      for (let i = 0; i < bytes.length; i += 32768)
        pieces.push(String.fromCharCode(...bytes.subarray(i, i + 32768)));
      requestId.current ||= crypto.randomUUID();
      const result = await request<{ item: Item }>("/api/speech", "POST", {
        audio: btoa(pieces.join("")),
        mime: blob.type,
        reference,
        consent:
          consent ===
          `${capabilities?.provider}:${capabilities?.consentVersion}`,
        provider: capabilities?.provider,
        consentVersion: capabilities?.consentVersion,
        requestId: requestId.current,
      });
      setNotice(
        result.item.status === "failed"
          ? result.item.error || "Bản gửi trước cần thử lại."
          : "Đã lưu bản ghi riêng tư. Bạn có thể tiếp tục học trong lúc nhận dạng.",
      );
      await load();
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function remove(item: Item) {
    if (!(await confirm({ message: "Xóa audio và nội dung nhận dạng của bản ghi này?", confirmLabel: "Xóa bản ghi" })))
      return;
    generation.current.value++;
    setBusy(true);
    setNotice("");
    try {
      await request("/api/speech", "DELETE", { id: item.id });
      setNotice("Đã xóa bản ghi.");
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      await load();
      setBusy(false);
    }
  }
  const pending = items.some((item) =>
    ["staging", "queued", "active"].includes(item.status),
  );
  const ready = capabilities?.configured && capabilities.workerOnline;
  return (
    <main className="page">
      <Link href="/library">← Nghe · Đọc · Nói</Link>
      <p className="eyebrow">LẮNG NGHE CÁCH BẠN DIỄN ĐẠT</p>
      <h1 className="page-title">Luyện nói với bản ghi riêng</h1>
      <p className="muted">
        Thu từ hoặc câu ngắn, nghe lại và xem lời nói được nhận dạng. Kết quả
        nhận dạng chưa phải điểm phát âm.
      </p>
      <p className="muted small">
        {capabilities?.provider === "gemini"
          ? "Nhận dạng bởi Google · tối đa 20 lượt/ngày UTC cho toàn hệ thống · không tự chuyển dịch vụ trả phí."
          : capabilities?.provider === "whispercpp"
            ? "Nhận dạng trên máy chủ local · audio không gửi Google."
            : "Dịch vụ nhận dạng chưa cấu hình."}
      </p>
      {error && (
        <div className="notice" role="alert">
          {error}{" "}
          <button className="text-button" onClick={() => void load()}>
            Thử tải lại
          </button>
        </div>
      )}
      <div className="dashboard-grid spaced">
        <section className="panel speech-recorder">
          <h2>Nghe lại chính mình</h2>
          <label>
            Câu hoặc từ đang luyện (không bắt buộc)
            <textarea
              className="control-input"
              maxLength={300}
              rows={3}
              value={reference}
              disabled={busy || recording || requestingMic}
              onChange={(e) => {
                setReference(e.target.value);
                requestId.current = "";
              }}
            />
          </label>
          <p className="muted small">
            Tối đa 20 giây · 3MB. Câu đang luyện giúp bạn đối chiếu với nội dung
            nhận dạng.
          </p>
          <div className="task-actions">
            <button
              className="primary-button"
              disabled={busy || requestingMic}
              onClick={() => void toggleRecord()}
            >
              {requestingMic
                ? "Đang mở microphone…"
                : recording
                  ? `Dừng thu · ${seconds}s`
                  : "Bắt đầu thu âm"}
            </button>
          </div>
          <label>
            Hoặc nhập audio WAV, WebM, M4A
            <input
              type="file"
              accept="audio/wav,audio/webm,audio/mp4,.m4a"
              disabled={busy || recording || requestingMic}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 3000000) {
                  setNotice("File phải nhỏ hơn 3MB.");
                  return;
                }
                const mime = /\.wav$/i.test(file.name)
                  ? "audio/wav"
                  : /\.(m4a|mp4)$/i.test(file.name)
                    ? "audio/mp4"
                    : file.type.split(";")[0];
                if (!["audio/wav", "audio/webm", "audio/mp4"].includes(mime)) {
                  setNotice("Hãy chọn WAV, WebM hoặc M4A.");
                  return;
                }
                setBlob(new Blob([file], { type: mime }));
                requestId.current = "";
                setConsent("");
                setNotice("Đã nhập file; hãy nghe lại trước khi gửi.");
              }}
            />
          </label>
          {blob && (
            <div>
              <p>Bản thu hiện tại · {(blob.size / 1000).toFixed(0)}KB</p>
              {url && (
                <audio
                  className="speech-player"
                  aria-label="Nghe bản thu trên thiết bị"
                  controls
                  src={url}
                />
              )}
              <label className="speech-consent">
                <input
                  type="checkbox"
                  checked={
                    consent ===
                    `${capabilities?.provider}:${capabilities?.consentVersion}`
                  }
                  disabled={busy || recording || requestingMic}
                  onChange={(e) =>
                    setConsent(
                      e.target.checked
                        ? `${capabilities?.provider}:${capabilities?.consentVersion}`
                        : "",
                    )
                  }
                />
                {capabilities?.externalProcessing
                  ? "Đồng ý lưu bản ghi riêng tư và gửi audio tới Google để nhận dạng. Google có thể dùng dữ liệu free tier để cải thiện sản phẩm."
                  : "Đồng ý gửi và lưu bản ghi riêng tư trên máy chủ để nhận dạng local."}
              </label>
              <button
                className="primary-button"
                disabled={
                  busy ||
                  recording ||
                  consent !==
                    `${capabilities?.provider}:${capabilities?.consentVersion}` ||
                  !ready ||
                  pending
                }
                onClick={() => void send()}
              >
                Gửi nhận dạng
              </button>
              <button
                className="soft-button"
                disabled={busy || recording || requestingMic || pending}
                onClick={() => {
                  requestId.current = "";
                  setNotice(
                    "Lần gửi mới đã sẵn sàng; bấm Gửi khi muốn thử lại.",
                  );
                }}
              >
                Tạo lần gửi mới
              </button>
            </div>
          )}
          {!ready && (
            <p className="notice">
              Nhận dạng trên hệ thống chưa hoạt động. Bạn vẫn có thể thu và nghe
              lại trên thiết bị.
            </p>
          )}
          {pending && (
            <p role="status">
              Một bản ghi đang được xử lý. Hãy đợi kết quả trước khi gửi bản
              mới.
            </p>
          )}
          <p
            className={notice ? "notice" : "sr-only"}
            role="status"
            aria-live="polite"
          >
            {notice}
          </p>
        </section>
        <section className="panel">
          <h2>Bản ghi của bạn</h2>
          <p className="muted small">
            30 bản gần nhất, chỉ tài khoản của bạn truy cập được. Audio tạm trên
            thiết bị sẽ mất khi rời trang; bản đã gửi được lưu trong lịch sử
            này.
          </p>
          {!capabilities && !error ? (
            <p role="status">Đang tải lịch sử…</p>
          ) : items.length === 0 ? (
            <p>Chưa có bản ghi đã gửi.</p>
          ) : (
            items.map((item) => (
              <article className="speech-item" key={item.id}>
                <strong>{labels[item.status]}</strong>
                <p className="muted small">
                  {new Date(item.createdAt).toLocaleString("vi-VN")}
                </p>
                {item.reference && (
                  <p lang="ko">Đang luyện: {item.reference}</p>
                )}
                {item.transcript && (
                  <>
                    <p className="eyebrow">NỘI DUNG NHẬN DẠNG</p>
                    <p lang="ko" className="speech-transcript">
                      {item.transcript}
                    </p>
                    <p className="muted small">
                      {item.model} · {item.engine} ·{" "}
                      {item.elapsedMs
                        ? (item.elapsedMs / 1000).toFixed(1) + "s xử lý"
                        : ""}
                    </p>
                  </>
                )}
                {item.error && <p role="alert">{item.error}</p>}
                {item.status !== "deleted" && !item.audioRemoved && (
                  <PrivateAudio id={item.id} />
                )}
                <button
                  className="text-button"
                  disabled={busy || recording || requestingMic}
                  onClick={() => void remove(item)}
                >
                  {item.status === "deleted"
                    ? "Thử hoàn tất xóa file"
                    : "Xóa bản ghi"}
                </button>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
export default function SpeechPage() {
  return (
    <Suspense
      fallback={
        <main className="page" role="status">
          Đang mở luyện nói…
        </main>
      }
    >
      <SpeechSession />
    </Suspense>
  );
}
