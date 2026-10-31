"use client";

import { LoaderCircle, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "./sample-audio-player.css";

type PlaybackOwner = { utterance: SpeechSynthesisUtterance; stop: () => void };
let activePlayback: PlaybackOwner | null = null;

function release(current: SpeechSynthesisUtterance, cancel = false) {
  current.onstart = current.onend = current.onerror = current.onboundary = null;
  current.onpause = current.onresume = null;
  if (activePlayback?.utterance === current) {
    activePlayback = null;
    if (cancel) window.speechSynthesis.cancel();
  }
}

export function SampleAudioPlayer({ text, label = "Nghe mẫu", compact = false }: {
  text: string; label?: string; compact?: boolean;
}) {
  return <Playback key={text} text={text} label={label} compact={compact} />;
}

function Playback({ text, label, compact }: { text: string; label: string; compact: boolean }) {
  const [state, setState] = useState<"idle" | "loading" | "playing" | "paused">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const elapsedRef = useRef(0);
  const startedAt = useRef(0);
  const running = useRef(false);

  useEffect(() => () => {
    const current = utterance.current;
    if (current) release(current, true);
    utterance.current = null;
  }, []);

  useEffect(() => {
    if (state !== "playing") return;
    const timer = setInterval(() => setElapsed(elapsedRef.current + (performance.now() - startedAt.current) / 1000), 200);
    return () => clearInterval(timer);
  }, [state]);

  useEffect(() => {
    if (state !== "loading") return;
    const timer = setTimeout(() => {
      const current = utterance.current;
      if (current) release(current, true);
      utterance.current = null;
      running.current = false;
      setState("idle");
      setError("Giọng đọc chưa phản hồi. Hãy thử lại.");
    }, 10000);
    return () => clearTimeout(timer);
  }, [state]);

  function toggle() {
    const synth = window.speechSynthesis;
    if (!synth || typeof SpeechSynthesisUtterance === "undefined") {
      setError("Thiết bị chưa hỗ trợ giọng đọc.");
      return;
    }
    if (state === "playing") { synth.pause(); return; }
    if (state === "paused") { synth.resume(); return; }
    // Reset the old UI without relying on browsers to emit an error on cancel().
    activePlayback?.stop();
    synth.cancel();
    synth.resume();
    const current = new SpeechSynthesisUtterance(text);
    utterance.current = current;
    current.lang = "ko-KR";
    current.rate = 0.88;
    setError("");
    setElapsed(0);
    setProgress(0);
    elapsedRef.current = 0;
    running.current = false;
    setState("loading");
    activePlayback = { utterance: current, stop: () => {
      release(current, true);
      utterance.current = null;
      running.current = false;
      setState("idle");
      setElapsed(0);
      setProgress(0);
    } };
    current.onstart = () => {
      startedAt.current = performance.now();
      running.current = true;
      setState("playing");
    };
    current.onpause = () => {
      if (running.current) elapsedRef.current += (performance.now() - startedAt.current) / 1000;
      running.current = false;
      setElapsed(elapsedRef.current);
      setState("paused");
    };
    current.onresume = () => {
      startedAt.current = performance.now();
      running.current = true;
      setState("playing");
    };
    current.onboundary = (event) => setProgress(Math.min(99, event.charIndex / Math.max(1, text.length) * 100));
    const finish = (completed: boolean) => {
      setElapsed(elapsedRef.current + (running.current ? (performance.now() - startedAt.current) / 1000 : 0));
      running.current = false;
      setProgress(completed ? 100 : 0);
      setState("idle");
      release(current);
      utterance.current = null;
    };
    current.onend = () => finish(true);
    current.onerror = (event) => {
      finish(false);
      if (event.error !== "interrupted" && event.error !== "canceled") setError("Chưa phát được giọng đọc. Hãy thử lại.");
    };
    try { synth.speak(current); } catch {
      release(current, true);
      utterance.current = null;
      running.current = false;
      setState("idle");
      setError("Chưa phát được giọng đọc. Hãy thử lại.");
    }
  }

  const seconds = Math.floor(elapsed);
  const actionLabel = state === "playing" ? `Tạm dừng: ${label}` : state === "paused" ? `Tiếp tục: ${label}` : label;
  return (
    <div className={`sample-audio${compact ? " sample-audio-compact" : ""}`} role="group" aria-label={label}>
      <button type="button" className="soft-button sample-audio-toggle" onClick={toggle}
        aria-label={actionLabel} title={actionLabel} aria-busy={state === "loading"}
        disabled={!text.trim() || state === "loading"}>
        {state === "loading" ? <LoaderCircle size={18} className="sample-audio-spinner" aria-hidden="true" /> : state === "playing" ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
      </button>
      <progress className="sample-audio-progress" max={100} value={progress} aria-label={`Tiến trình: ${label}`} />
      <span className="sample-audio-time" aria-label="Thời gian đã phát">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</span>
      <span className="sr-only" role="status">{state === "loading" ? "Đang tải giọng đọc…" : state === "playing" ? `Đang phát: ${label}` : state === "paused" ? `Đã tạm dừng: ${label}` : progress === 100 ? `Đã phát xong: ${label}` : ""}</span>
      {error && <span className="sample-audio-error small" role="alert">{error}</span>}
    </div>
  );
}
