"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  ChevronDown,
  CircleHelp,
  Clipboard,
  Flame,
  History,
  Layers2,
  LoaderCircle,
  Search,
  Sparkles,
  Star,
  Volume2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LEVELS, TOPICS, type GradeReport, type Sentence } from "@/lib/types";
import type { ReactNode } from "react";
import { SampleAudioPlayer } from "@/components/sample-audio-player";

type Stats = {
  totalCompleted: number;
  averageScore: number;
  weakTopics: { _id: string; averageScore: number; attempts: number }[];
};
type DictionaryEntry = {
  id: string;
  word: string;
  pronunciation: string;
  pos: string;
  level: string;
  entryType: "word" | "idiom";
  link: string;
  senses: {
    definition: string;
    translations: { word: string; definition: string }[];
  }[];
};
type DictionaryLookup = { configured: boolean; items: DictionaryEntry[] };
type SavedReview = GradeReport & {
  userTranslation: string;
  submittedAt: string;
  sentence: Sentence;
};
type SavedFavorite = {
  sentence: Sentence;
  submission?:
    | (GradeReport & { userTranslation: string; submittedAt: string })
    | null;
};
const EMPTY_STATS: Stats = {
  totalCompleted: 0,
  averageScore: 0,
  weakTopics: [],
};

function apiErrorMessage(
  response: Response,
  message?: string,
  fallback = "Có lỗi xảy ra.",
) {
  const requestId = response.headers.get("x-request-id");
  return `${message || fallback}${requestId ? ` · Mã log: ${requestId}` : ` · HTTP ${response.status}`}`;
}

function SaveKnowledge({
  term,
  meaning,
  kind = "phrase",
}: {
  term: string;
  meaning: string;
  kind?: string;
}) {
  return (
    <a
      className="ml-2 text-xs font-semibold text-blue-700"
      href={
        "/vocabulary?term=" +
        encodeURIComponent(term) +
        "&meaning=" +
        encodeURIComponent(meaning) +
        "&kind=" +
        kind
      }
    >
      Lưu để ôn →
    </a>
  );
}

function KoreanLinkedText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const parts = text.split(/([가-힣ㄱ-ㅎㅏ-ㅣ]+)/u);
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (!/[가-힣ㄱ-ㅎㅏ-ㅣ]/u.test(part))
          return <span key={index}>{part}</span>;
        return (
          <button
            key={`${part}-${index}`}
            type="button"
            className="kr-font cursor-pointer border-0 bg-transparent p-0 text-inherit underline decoration-indigo-300 decoration-dotted underline-offset-[3px] hover:rounded-sm hover:bg-indigo-50 hover:decoration-indigo-700 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
            title={`Bấm để tra “${part}”`}
            onClick={(event) => {
              const bounds = event.currentTarget.getBoundingClientRect();
              window.dispatchEvent(
                new CustomEvent("everlang:dictionary-lookup", {
                  detail: { word: part, bounds },
                }),
              );
            }}
          >
            {part}
          </button>
        );
      })}
    </span>
  );
}

export default function Practice({
  selectedId,
  initialTopic = "ALL",
}: {
  selectedId?: string;
  initialTopic?: string;
}) {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [topic, setTopic] = useState(initialTopic);
  const [level, setLevel] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [mistakesOnly, setMistakesOnly] = useState(false);
  const [pages, setPages] = useState(1);
  const [mode, setMode] = useState<"list" | "card">("list");
  const [active, setActive] = useState(0);
  const [userId, setUserId] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [stats, setStats] = useState(EMPTY_STATS);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [libraryMode, setLibraryMode] = useState<
    "reviews" | "favorites" | null
  >(null);
  const [libraryItems, setLibraryItems] = useState<
    Array<SavedReview | SavedFavorite>
  >([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [report, setReport] = useState<GradeReport | null>(null);
  const [reportSentence, setReportSentence] = useState<Sentence | null>(null);
  const [error, setError] = useState("");
  const [retryGrading, setRetryGrading] = useState<Sentence | null>(null);
  const [loading, setLoading] = useState(false);
  const [gradingId, setGradingId] = useState("");
  const [loadingSavedId, setLoadingSavedId] = useState("");

  const [revealed, setRevealed] = useState<string[]>([]);
  const gradingRequestRef = useRef(false);

  const versions = useRef<Record<string, number>>({});
  const pendingDrafts = useRef<Record<string, string>>({});
  const saving = useRef(false);
  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((p) => {
        if (p.user) setUserId(p.user.id);
      });
    fetch("/api/drafts")
      .then((r) => r.json())
      .then((p) => {
        if (!p.drafts) return;
        const values: Record<string, string> = {};
        for (const d of p.drafts) {
          values[d.sentence_id] = d.text;
          versions.current[d.sentence_id] = d.version;
        }
        setDrafts(values);
      });
    const timer = window.setInterval(async () => {
      if (saving.current) return;
      saving.current = true;
      try {
        for (const [sentenceId, text] of Object.entries(
          pendingDrafts.current,
        )) {
          const r = await fetch("/api/drafts", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sentenceId,
              text,
              version: versions.current[sentenceId] || 0,
            }),
          });
          const p = await r.json();
          if (r.ok) {
            versions.current[sentenceId] = p.version;
            if (pendingDrafts.current[sentenceId] === text)
              delete pendingDrafts.current[sentenceId];
          } else {
            setError(p.error || "Không lưu được nháp");
            if (r.status === 409) delete pendingDrafts.current[sentenceId];
          }
        }
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "Không lưu được nháp; bản nhập vẫn ở trên máy.",
        );
      } finally {
        saving.current = false;
      }
    }, 1200);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!userId) return;
    const key = `everlang-pending-job-${userId}`;
    const jobId = localStorage.getItem(key);
    if (!jobId) return;
    const controller = new AbortController();
    const timer = setInterval(async () => {
      if (gradingRequestRef.current) return;
      try {
        const r = await fetch("/api/jobs?id=" + encodeURIComponent(jobId), {
          signal: controller.signal,
        });
        const job = await r.json();
        if (!r.ok || job.status === "failed") {
          localStorage.removeItem(key);
          clearInterval(timer);
          setError(job.error || "Không đọc được lượt chấm.");
          return;
        }
        if (job.status === "completed") {
          localStorage.removeItem(key);
          clearInterval(timer);
          setReport(job.report);
          setReportSentence(job.report.sentence);
        }
      } catch (e) {
        if (!controller.signal.aborted)
          setError(e instanceof Error ? e.message : "Chưa thể tải kết quả.");
      }
    }, 2500);
    return () => {
      clearInterval(timer);
      controller.abort();
    };
  }, [userId]);

  const loadSentences = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "50",
        topic,
        level,
        search,
      });
      if (mistakesOnly) params.set("mistakes", "true");
      if (selectedId) params.set("sentenceId", selectedId);
      const response = await fetch(`/api/sentences?${params}`);
      const payload = await response.json();
      if (!response.ok)
        throw new Error(
          apiErrorMessage(response, payload.error, "Không tải được bài tập."),
        );
      setSentences(payload.items);
      setPages(payload.pages || 1);
      setActive(0);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }, [level, page, topic, search, selectedId, mistakesOnly]);

  const loadStats = useCallback(async () => {
    try {
      const response = await fetch("/api/user/stats");
      if (response.ok) setStats(await response.json());
    } catch {
      /* statistics can be retried after the next submission */
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSentences();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadSentences]);
  useEffect(() => {
    if (!userId) return;
    const timer = window.setTimeout(() => {
      void loadStats();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadStats, userId]);
  useEffect(() => {
    if (!userId) return;
    fetch("/api/user/favorites")
      .then(async (response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (payload)
          setFavoriteIds(
            payload.favorites.map((item: SavedFavorite) => item.sentence._id),
          );
      })
      .catch(() => {
        /* favorites can be loaded again from the library */
      });
  }, [userId]);

  const visible = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return sentences;
    return sentences.filter((item) =>
      `${item.viText} ${item.koSampleAnswer} ${item.topic} ${item.keyVocab.join(" ")}`
        .toLocaleLowerCase()
        .includes(query),
    );
  }, [search, sentences]);
  const current = visible[Math.min(active, Math.max(visible.length - 1, 0))];
  const completedPercent = Math.min(
    100,
    Math.round((stats.totalCompleted / Math.max(100, sentences.length)) * 100),
  );

  function changeFilter(which: "topic" | "level", value: string) {
    if (which === "topic") setTopic(value);
    else setLevel(value);
    setPage(1);
  }
  function saveDraft(id: string, value: string) {
    const next = { ...drafts, [id]: value };
    setDrafts(next);
    pendingDrafts.current[id] = value;
    if (userId)
      localStorage.setItem(
        `everlang-draft-recovery-${userId}`,
        JSON.stringify(next),
      );
  }
  async function submit(item: Sentence, forceRegrade = false) {
    if (gradingRequestRef.current) return;
    const userTranslation = drafts[item._id]?.trim();
    if (!userTranslation) {
      setError("Hãy nhập bản dịch tiếng Hàn trước khi nộp.");
      return;
    }
    gradingRequestRef.current = true;
    setError("");
    setRetryGrading(null);
    setGradingId(item._id);
    try {
      const response = await fetch("/api/submissions/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sentenceId: item._id,
          userTranslation,
          forceRegrade,
          requestId: crypto.randomUUID(),
        }),
      });
      let payload = await response.json();
      if (!response.ok) {
        if (payload.code === "GRADING_PREVIOUS_FAILED") setRetryGrading(item);
        throw new Error(
          apiErrorMessage(response, payload.error, "Không thể chấm bài."),
        );
      }
      if (response.status === 202) {
        const jobId = payload.jobId;
        localStorage.setItem(`everlang-pending-job-${userId}`, jobId);
        for (let attempt = 0; attempt < 160; attempt++) {
          await new Promise((resolve) => setTimeout(resolve, 1800));
          const jr = await fetch("/api/jobs?id=" + encodeURIComponent(jobId));
          const job = await jr.json();
          if (!jr.ok) throw new Error(job.error || "Không đọc được lượt chấm");
          if (job.status === "failed") {
            localStorage.removeItem(`everlang-pending-job-${userId}`);
            setRetryGrading(item);
            throw new Error(job.error);
          }
          if (job.status === "completed") {
            payload = job.report;
            localStorage.removeItem(`everlang-pending-job-${userId}`);
            break;
          }
        }
        if (!payload.score && payload.score !== 0)
          throw new Error(
            "Bài đang được xử lý. Bạn có thể xem lại trong lịch sử sau.",
          );
      }
      setReport(payload);
      setReportSentence(item);
      if (userId) void loadStats();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Có lỗi xảy ra.");
    } finally {
      gradingRequestRef.current = false;
      setGradingId("");
    }
  }
  async function viewSaved(item: Sentence) {
    if (!userId) {
      setError(
        "Đang khởi tạo định danh trình duyệt, hãy thử lại sau giây lát.",
      );
      return;
    }
    setError("");
    setLoadingSavedId(item._id);
    try {
      const params = new URLSearchParams({ sentenceId: item._id });
      const response = await fetch(`/api/submissions?${params}`);
      const payload = await response.json();
      if (!response.ok)
        throw new Error(
          apiErrorMessage(
            response,
            payload.error,
            "Không tải được đánh giá đã lưu.",
          ),
        );
      if (!payload.submission)
        throw new Error(
          "Câu này chưa có đánh giá đã lưu. Hãy nộp bài để chấm lần đầu.",
        );
      setReport(payload.submission as GradeReport);
      setReportSentence(item);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Có lỗi xảy ra.");
    } finally {
      setLoadingSavedId("");
    }
  }
  async function openLibrary(which: "reviews" | "favorites") {
    if (!userId) return;
    setLibraryMode(which);
    setLibraryLoading(true);
    try {
      const endpoint =
        which === "reviews" ? "/api/submissions" : "/api/user/favorites";
      const response = await fetch(endpoint);
      const payload = await response.json();
      if (!response.ok)
        throw new Error(
          apiErrorMessage(response, payload.error, "Không tải được danh sách."),
        );
      setLibraryItems(
        which === "reviews" ? payload.submissions : payload.favorites,
      );
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Không tải được danh sách.",
      );
      setLibraryMode(null);
    } finally {
      setLibraryLoading(false);
    }
  }
  async function toggleFavorite(item: Sentence) {
    if (!userId) return;
    const favorite = !favoriteIds.includes(item._id);
    try {
      const response = await fetch("/api/user/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentenceId: item._id, favorite }),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(
          apiErrorMessage(response, payload.error, "Không lưu được yêu thích."),
        );
      setFavoriteIds((currentIds) =>
        favorite
          ? [...currentIds, item._id]
          : currentIds.filter((id) => id !== item._id),
      );
      if (libraryMode === "favorites" && !favorite)
        setLibraryItems((items) =>
          items.filter(
            (entry) =>
              !("sentence" in entry) || entry.sentence._id !== item._id,
          ),
        );
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Không lưu được yêu thích.",
      );
    }
  }
  function toggleAnswer(id: string) {
    setRevealed((value) =>
      value.includes(id) ? value.filter((item) => item !== id) : [...value, id],
    );
  }
  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setError("Không thể sao chép nội dung trên trình duyệt này.");
    }
  }

  return (
    <main className="practice min-h-screen text-slate-800">
      <div className="mx-auto max-w-7xl px-5 pt-7">
        <p className="eyebrow">THỰC HÀNH MỖI NGÀY</p>
        <h1 className="page-title">Luyện dịch tiếng Hàn</h1>
        <p className="muted">
          Viết theo cách của bạn. Hiểu từng lỗi, tiến bộ từng ngày.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-5 rounded-2xl border border-white bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1.2fr]">
            <label className="relative block">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setActive(0);
                }}
                placeholder="Tìm câu, từ vựng, từ khóa..."
                className="control-input pl-10"
              />
            </label>
            <select
              value={topic}
              onChange={(event) => changeFilter("topic", event.target.value)}
              className="control-input"
            >
              <option value="ALL">Tất cả chủ đề</option>
              {TOPICS.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <select
              value={level}
              onChange={(event) => changeFilter("level", event.target.value)}
              className="control-input"
            >
              <option value="ALL">Tất cả cấp độ</option>
              {LEVELS.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button
                onClick={() => setMode("list")}
                className={`mode-button ${mode === "list" ? "mode-button-active" : ""}`}
              >
                <Clipboard size={15} />
                Danh sách
              </button>
              <button
                onClick={() => setMode("card")}
                className={`mode-button ${mode === "card" ? "mode-button-active" : ""}`}
              >
                <Layers2 size={15} />
                Thẻ từng câu
              </button>
            </div>
          </div>
        </section>

        <section className="mb-5 rounded-2xl border border-white bg-white px-5 py-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">
              Tiến độ bài luyện
            </span>
            <span className="font-bold text-indigo-600">
              {completedPercent}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all"
              style={{ width: `${completedPercent}%` }}
            />
          </div>
          {stats.weakTopics.length > 0 && (
            <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
              <Flame size={13} className="text-orange-500" /> Nên ôn thêm:{" "}
              {stats.weakTopics.map((item) => item._id).join(", ")}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
            <button
              className="soft-button"
              onClick={() => {
                setMistakesOnly(!mistakesOnly);
                setPage(1);
                setLibraryMode(null);
              }}
            >
              {mistakesOnly ? "Xem tất cả bài" : "Ôn lại lỗi sai"}
            </button>
            <button
              onClick={() => void openLibrary("reviews")}
              className={`soft-button ${libraryMode === "reviews" ? "border-indigo-300 text-indigo-700" : ""}`}
            >
              <History size={15} />
              Bài đã chấm
            </button>
            <button
              onClick={() => void openLibrary("favorites")}
              className={`soft-button ${libraryMode === "favorites" ? "border-amber-300 text-amber-800" : ""}`}
            >
              <Star size={15} />
              Yêu thích ({favoriteIds.length})
            </button>
            {libraryMode && (
              <button
                onClick={() => setLibraryMode(null)}
                className="soft-button"
              >
                <X size={15} />
                Quay lại luyện tập
              </button>
            )}
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
          >
            <CircleHelp size={17} className="mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p>{error}</p>
              {retryGrading && (
                <button
                  type="button"
                  className="soft-button mt-2"
                  disabled={Boolean(gradingId) || !drafts[retryGrading._id]?.trim()}
                  onClick={() => void submit(retryGrading, true)}
                >
                  Chấm lại bằng AI
                </button>
              )}
            </div>
            <button
              className="ml-auto"
              onClick={() => setError("")}
              aria-label="Đóng"
            >
              <X size={16} />
            </button>
          </div>
        )}
        {libraryMode ? (
          <section className="space-y-3">
            {libraryLoading ? (
              <div className="grid min-h-48 place-items-center text-indigo-600">
                <LoaderCircle className="animate-spin" size={28} />
              </div>
            ) : libraryMode === "reviews" ? (
              (libraryItems as SavedReview[]).length ? (
                (libraryItems as SavedReview[]).map((entry) => (
                  <button
                    key={String(entry.submittedAt) + entry.sentence._id}
                    onClick={() => {
                      setReport(entry);
                      setReportSentence(entry.sentence);
                      setLibraryMode(null);
                    }}
                    className="block w-full rounded-2xl border border-white bg-white p-4 text-left shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-indigo-700">
                        {entry.sentence.topic} · {entry.sentence.level}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                        {entry.score}/100
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium leading-6">
                      {entry.sentence.viText}
                    </p>
                    <p className="kr-font mt-2 line-clamp-2 text-xs text-slate-600">
                      {entry.userTranslation}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-700">
                      <History size={13} />
                      Xem lại đánh giá đã lưu
                    </span>
                  </button>
                ))
              ) : (
                <EmptyLibrary message="Bạn chưa có bài nào được chấm." />
              )
            ) : (libraryItems as SavedFavorite[]).length ? (
              (libraryItems as SavedFavorite[]).map((entry) => (
                <article
                  key={entry.sentence._id}
                  className="rounded-2xl border border-white bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-indigo-700">
                        {entry.sentence.topic} · {entry.sentence.level}
                      </span>
                      <p className="mt-2 text-sm font-medium leading-6">
                        {entry.sentence.viText}
                      </p>
                      <KoreanLinkedText
                        text={entry.sentence.koSampleAnswer}
                        className="kr-font mt-2 block text-xs leading-5 text-slate-600"
                      />
                    </div>
                    <button
                      onClick={() => void toggleFavorite(entry.sentence)}
                      className="rounded-lg p-2 text-amber-500 hover:bg-amber-50"
                      aria-label="Bỏ yêu thích"
                    >
                      <Star size={18} fill="currentColor" />
                    </button>
                  </div>
                  {entry.submission && (
                    <button
                      onClick={() => {
                        setReport(entry.submission as GradeReport);
                        setReportSentence(entry.sentence);
                        setLibraryMode(null);
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700"
                    >
                      <History size={14} />
                      Xem lại đánh giá đã lưu · {entry.submission.score}/100
                    </button>
                  )}
                </article>
              ))
            ) : (
              <EmptyLibrary message="Bạn chưa lưu bài yêu thích nào." />
            )}
          </section>
        ) : loading ? (
          <div className="grid min-h-64 place-items-center text-indigo-600">
            <LoaderCircle className="animate-spin" size={30} />
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
            <BookOpenCheck className="mx-auto mb-3 text-slate-300" size={38} />
            <h2 className="font-semibold">Không tìm thấy câu phù hợp</h2>
            <p className="mt-1 text-sm text-slate-500">
              Thử thay đổi từ khóa hoặc bộ lọc.
            </p>
          </div>
        ) : mode === "list" ? (
          <div className="space-y-4">
            {visible.map((item) => (
              <ExerciseCard
                key={item._id}
                item={item}
                answer={drafts[item._id] || ""}
                revealed={revealed.includes(item._id)}
                favorite={favoriteIds.includes(item._id)}
                busy={gradingId === item._id}
                savedBusy={loadingSavedId === item._id}
                onToggleFavorite={() => void toggleFavorite(item)}
                onAnswer={(value) => saveDraft(item._id, value)}
                onReveal={() => toggleAnswer(item._id)}
                onSubmit={() => void submit(item)}
                onViewSaved={() => void viewSaved(item)}
                onCopy={() => void copyText(item.viText)}
              />
            ))}
          </div>
        ) : current ? (
          <section className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-white bg-white shadow-xl shadow-indigo-900/[0.06]">
            <div className="flex items-center justify-between bg-[var(--brand-dark)] px-6 py-4 text-white">
              <span className="text-sm font-semibold text-indigo-200">
                Câu {active + 1} / {visible.length}
              </span>
              <div className="flex gap-2">
                <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs">
                  {current.topic}
                </span>
                <span className="rounded-lg bg-amber-300 px-2.5 py-1 text-xs font-bold text-indigo-950">
                  {current.level}
                </span>
              </div>
            </div>
            <div className="space-y-5 p-5 sm:p-8">
              <SourceText
                item={current}
                onCopy={() => void copyText(current.viText)}
              />
              <VocabHints values={current.keyVocab} />
              <AnswerInput
                value={drafts[current._id] || ""}
                onChange={(value) => saveDraft(current._id, value)}
                onSubmit={() => void submit(current)}
                busy={gradingId === current._id}
                sampleText={current.koSampleAnswer}
                onSaved={() => void viewSaved(current)}
                savedBusy={loadingSavedId === current._id}
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => void toggleFavorite(current)}
                    className={`soft-button ${favoriteIds.includes(current._id) ? "border-amber-300 text-amber-700" : ""}`}
                  >
                    <Star
                      size={15}
                      fill={
                        favoriteIds.includes(current._id)
                          ? "currentColor"
                          : "none"
                      }
                    />
                    {favoriteIds.includes(current._id)
                      ? "Đã yêu thích"
                      : "Yêu thích"}
                  </button>
                  <button
                    onClick={() => toggleAnswer(current._id)}
                    className="soft-button text-indigo-700"
                  >
                    <BookOpenCheck size={16} />
                    {revealed.includes(current._id)
                      ? "Ẩn đáp án & ngữ pháp"
                      : "Xem đáp án & ngữ pháp"}
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={active === 0}
                    onClick={() => setActive((value) => Math.max(0, value - 1))}
                    className="soft-button"
                  >
                    <ArrowLeft size={15} />
                    Câu trước
                  </button>
                  <button
                    disabled={active >= visible.length - 1}
                    onClick={() =>
                      setActive((value) =>
                        Math.min(visible.length - 1, value + 1),
                      )
                    }
                    className="soft-button"
                  >
                    Câu tiếp
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
              {revealed.includes(current._id) && (
                <AnswerDetails
                  item={current}
                />
              )}
            </div>
          </section>
        ) : null}

        {pages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              className="soft-button"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              <ArrowLeft size={15} />
              Trước
            </button>
            <span className="text-xs font-medium text-slate-500">
              Trang {page} / {pages}
            </span>
            <button
              className="soft-button"
              disabled={page >= pages}
              onClick={() => setPage((value) => Math.min(pages, value + 1))}
            >
              Tiếp
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>

      <footer className="mt-10 border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        Luyện Dịch Việt – Hàn · Học đều mỗi ngày, tiến bộ từng câu
      </footer>
      <DictionarySelectionLookup />
      {report && reportSentence && (
        <GradeModal
          report={report}
          sentence={reportSentence}
          onClose={() => setReport(null)}
          onCopy={(text) => void copyText(text)}
          onRegrade={() => void submit(reportSentence, true)}
          regrading={gradingId === reportSentence._id}
        />
      )}
    </main>
  );
}

function SourceText({ item, onCopy }: { item: Sentence; onCopy: () => void }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="section-label">Đề bài · Tiếng Việt</span>
        <button
          onClick={onCopy}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-700"
        >
          <Clipboard size={13} />
          Sao chép
        </button>
      </div>
      <p className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-base font-medium leading-7 text-slate-800 sm:p-5 sm:text-lg">
        {item.viText}
      </p>
    </div>
  );
}
function AnswerInput({
  value,
  onChange,
  onSubmit,
  busy,
  sampleText,
  onSaved,
  savedBusy,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  busy: boolean;
  sampleText: string;
  onSaved: () => void;
  savedBusy: boolean;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="section-label">Bản dịch của bạn · Tiếng Hàn</label>
        <span className="text-[11px] text-slate-400">{value.length} ký tự</span>
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        placeholder="Nhập câu trả lời tiếng Hàn..."
        className="kr-input"
        maxLength={5000}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={onSubmit}
          disabled={busy || !value.trim()}
          className="primary-button"
        >
          {busy ? (
            <LoaderCircle className="animate-spin" size={16} />
          ) : (
            <Sparkles size={16} />
          )}
          Nộp bài & AI chấm điểm
        </button>
        <button onClick={onSaved} disabled={savedBusy} className="soft-button">
          {savedBusy ? (
            <LoaderCircle className="animate-spin" size={16} />
          ) : (
            <History size={16} />
          )}
          Xem đánh giá đã lưu
        </button>
        <SampleAudioPlayer text={sampleText} label="Nghe đáp án mẫu" />
      </div>
    </div>
  );
}
function AnswerDetails({
  item,
}: {
  item: Sentence;
}) {
  return (
    <div className="space-y-3 border-t border-slate-100 pt-4">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <span className="section-label text-emerald-800">
            Đáp án tham khảo
          </span>
          <SampleAudioPlayer text={item.koSampleAnswer} label="Nghe đáp án tham khảo" compact />
        </div>
        <KoreanLinkedText
          text={item.koSampleAnswer}
          className="kr-font text-base font-semibold leading-7 text-emerald-950"
        />
      </div>
      <HintPanel
        title="Ngữ pháp trọng tâm"
        values={item.keyGrammar}
        color="blue"
      />
    </div>
  );
}
function VocabHints({ values }: { values: string[] }) {
  const hints = values.slice(0, 3);
  if (!hints.length) return null;
  return (
    <div className="rounded-xl border border-amber-100 bg-amber-50/70 px-3 py-2 text-xs leading-5 text-amber-950">
      <b>Gợi ý:</b>{" "}
      {hints.map((hint, index) => (
        <span key={`${hint}-${index}`}>
          <KoreanLinkedText text={hint} />
          {index < hints.length - 1 ? ", " : "."}
        </span>
      ))}
    </div>
  );
}
function HintPanel({
  title,
  values,
  color,
}: {
  title: string;
  values: string[];
  color: "blue" | "amber";
}) {
  return (
    <div
      className={`hint-panel ${color === "blue" ? "hint-blue" : "hint-amber"}`}
    >
      <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wide">
        {title}
      </h4>
      <ul className="space-y-1 text-xs leading-5">
        {values.map((value, index) => (
          <li key={`${value}-${index}`}>
            • <KoreanLinkedText text={value} />
          </li>
        ))}
      </ul>
    </div>
  );
}
function ExerciseCard({
  item,
  answer,
  revealed,
  favorite,
  busy,
  savedBusy,
  onToggleFavorite,
  onAnswer,
  onReveal,
  onSubmit,
  onViewSaved,
  onCopy,
}: {
  item: Sentence;
  answer: string;
  revealed: boolean;
  favorite: boolean;
  busy: boolean;
  savedBusy: boolean;
  onToggleFavorite: () => void;
  onAnswer: (value: string) => void;
  onReveal: () => void;
  onSubmit: () => void;
  onViewSaved: () => void;
  onCopy: () => void;
}) {
  return (
    <article className="rounded-2xl border border-white bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700">
            {item.topic}
          </span>
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-900">
            {item.level}
          </span>
          {item.isAiGenerated && (
            <span className="rounded-full bg-violet-100 px-2 py-1 text-[10px] font-semibold text-violet-700">
              <Sparkles size={10} className="mr-1 inline" />
              AI
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFavorite}
            className={`rounded-lg p-1.5 ${favorite ? "text-amber-500" : "text-slate-400 hover:text-amber-500"}`}
            aria-label={favorite ? "Bỏ yêu thích" : "Lưu yêu thích"}
            title={favorite ? "Bỏ yêu thích" : "Lưu yêu thích"}
          >
            <Star size={16} fill={favorite ? "currentColor" : "none"} />
          </button>
          <button
            onClick={onCopy}
            className="text-xs text-slate-400 hover:text-indigo-700"
          >
            <Clipboard size={14} />
          </button>
        </div>
      </div>
      <p className="mb-3 text-sm font-medium leading-6 text-slate-800 sm:text-base">
        {item.viText}
      </p>
      <div className="mb-3">
        <VocabHints values={item.keyVocab} />
      </div>
      <AnswerInput
        value={answer}
        onChange={onAnswer}
        onSubmit={onSubmit}
        busy={busy}
        sampleText={item.koSampleAnswer}
        onSaved={onViewSaved}
        savedBusy={savedBusy}
      />
      <div className="mt-3 border-t border-slate-100 pt-3">
        <button
          onClick={onReveal}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900"
        >
          {revealed ? <X size={14} /> : <ChevronDown size={14} />}
          {revealed ? "Ẩn gợi ý & đáp án" : "Xem đáp án & ngữ pháp"}
        </button>
        {revealed && (
          <div className="mt-3">
            <AnswerDetails item={item} />
          </div>
        )}
      </div>
    </article>
  );
}
function EmptyLibrary({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white py-14 text-center">
      <BookOpenCheck className="mx-auto mb-3 text-slate-300" size={36} />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}
function GradeModal({
  report,
  sentence,
  onClose,
  onCopy,
  onRegrade,
  regrading,
}: {
  report: GradeReport;
  sentence: Sentence;
  onClose: () => void;
  onCopy: (text: string) => void;
  onRegrade: () => void;
  regrading: boolean;
}) {
  const tone =
    report.score >= 90
      ? "emerald"
      : report.score >= 75
        ? "blue"
        : report.score >= 50
          ? "amber"
          : "rose";
  const toneClasses = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  }[tone];
  const pillClasses = {
    emerald: "bg-emerald-100 text-emerald-800",
    blue: "bg-blue-100 text-blue-800",
    amber: "bg-amber-100 text-amber-800",
    rose: "bg-rose-100 text-rose-800",
  }[tone];
  const names: Record<GradeReport["accuracyRating"], string> = {
    Excellent: "Xuất sắc",
    Good: "Tốt",
    "Needs Improvement": "Cần cải thiện",
    Redo: "Nên làm lại",
  };
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Kết quả chấm bài"
    >
      <div className="my-auto max-h-[94vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between bg-[var(--brand-dark)] px-5 py-5 text-white sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
              Kết quả chấm AI
            </p>
            <h2 className="mt-1 text-xl font-bold">
              {sentence.topic} · {sentence.level}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRegrade}
              disabled={regrading}
              className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 disabled:opacity-50"
            >
              {regrading ? "Đang chấm lại…" : "Chấm lại bằng AI"}
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-indigo-100 hover:bg-white/10"
              aria-label="Đóng"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="custom-scroll max-h-[calc(94vh-80px)] space-y-4 overflow-y-auto p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-4">
            <div
              className={`grid size-20 place-items-center rounded-2xl ${toneClasses}`}
            >
              <div className="text-center">
                <span className="text-3xl font-extrabold">{report.score}</span>
                <span className="block text-[10px] font-semibold">/100</span>
              </div>
            </div>
            <div>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${pillClasses}`}
              >
                {names[report.accuracyRating]}
              </span>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-700">
                {report.overallComment}
              </p>
            </div>
          </div>
          <FeedbackSection
            title="Sửa lỗi ngữ pháp & tiểu từ"
            count={report.grammarErrors.length}
          >
            {report.grammarErrors.length ? (
              report.grammarErrors.map((item, i) => (
                <div key={i} className="rounded-xl bg-slate-50 p-3 text-sm">
                  <p className="text-rose-700">
                    <b>Bạn viết:</b>{" "}
                    <KoreanLinkedText text={item.error} className="kr-font" />
                  </p>
                  <p className="mt-1 text-emerald-800">
                    <b>Nên sửa:</b>{" "}
                    <KoreanLinkedText
                      text={item.correction}
                      className="kr-font"
                    />
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    {item.explanation}
                  </p>
                  <SaveKnowledge
                    term={item.correction}
                    meaning={item.explanation}
                    kind="grammar"
                  />
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                Không phát hiện lỗi ngữ pháp đáng kể.
              </p>
            )}
          </FeedbackSection>
          <FeedbackSection
            title="Gợi ý từ vựng nâng cao"
            count={report.vocabSuggestions.length}
          >
            {report.vocabSuggestions.length ? (
              report.vocabSuggestions.map((item, i) => (
                <div key={i} className="rounded-xl bg-amber-50 p-3 text-sm">
                  <p>
                    <KoreanLinkedText
                      text={item.original}
                      className="kr-font text-slate-500"
                    />{" "}
                    <ArrowRight size={13} className="mx-1 inline" />{" "}
                    <KoreanLinkedText
                      text={item.suggested}
                      className="kr-font font-bold text-amber-900"
                    />
                  </p>
                  <p className="mt-1 text-xs text-slate-600">{item.reason}</p>
                  <SaveKnowledge term={item.suggested} meaning={item.reason} />
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                Cách dùng từ phù hợp với ngữ cảnh.
              </p>
            )}
          </FeedbackSection>
          <FeedbackSection title="3 phiên bản dịch nâng cao" count={3}>
            {report.advancedRewrites.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-indigo-900">
                    {item.style}
                  </h3>
                  <button
                    onClick={() => onCopy(item.text)}
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-700"
                  >
                    <Clipboard size={13} />
                    Sao chép
                  </button>
                </div>
                <KoreanLinkedText
                  text={item.text}
                  className="kr-font text-sm font-medium leading-6 text-slate-900"
                />
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {item.explanation}
                </p>
              </div>
            ))}
          </FeedbackSection>
        </div>
      </div>
    </div>
  );
}
function FeedbackSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <details className="group rounded-2xl border border-slate-200 p-4" open>
      <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-slate-800">
        <span>
          {title}
          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
            {count}
          </span>
        </span>
        <ChevronDown size={16} className="transition group-open:rotate-180" />
      </summary>
      <div className="mt-3 space-y-2">{children}</div>
    </details>
  );
}

export function DictionarySelectionLookup() {
  const [selection, setSelection] = useState<{
    word: string;
    left: number;
    top: number;
    maxHeight: number;
  } | null>(null);
  const [lookup, setLookup] = useState<DictionaryLookup | null>(null);
  const [lookupError, setLookupError] = useState("");
  const popupRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function openLookup(word: string, bounds: DOMRect) {
      const normalized = word.trim();
      if (
        !normalized ||
        !/[가-힣ㄱ-ㅎㅏ-ㅣ]/u.test(normalized) ||
        normalized.length > 48
      )
        return;
      const width = Math.min(360, window.innerWidth - 24);
      const left = Math.max(
        12,
        Math.min(bounds.left, window.innerWidth - width - 12),
      );
      const maxHeight = Math.min(440, window.innerHeight - 24);
      const belowTop = bounds.bottom + 8;
      const belowSpace = window.innerHeight - belowTop - 12;
      const aboveSpace = bounds.top - 20;
      const openBelow = belowSpace >= 220 || belowSpace >= aboveSpace;
      const available = Math.max(
        160,
        Math.min(maxHeight, openBelow ? belowSpace : aboveSpace),
      );
      const top = openBelow
        ? Math.max(12, belowTop)
        : Math.max(12, bounds.top - available - 8);
      setSelection({ word: normalized, left, top, maxHeight: available });
    }
    function inspectSelection() {
      let word = "";
      let bounds: DOMRect | null = null;
      const active = document.activeElement;
      if (
        active instanceof HTMLTextAreaElement &&
        active.selectionStart !== active.selectionEnd
      ) {
        word = active.value
          .slice(active.selectionStart, active.selectionEnd)
          .trim();
        bounds = active.getBoundingClientRect();
      } else {
        const current = window.getSelection();
        word = current?.toString().trim() ?? "";
        if (current?.rangeCount && word)
          bounds = current.getRangeAt(0).getBoundingClientRect();
      }
      if (bounds) openLookup(word, bounds);
    }
    function handleAutoLookup(event: Event) {
      const detail = (event as CustomEvent<{ word: string; bounds: DOMRect }>)
        .detail;
      if (detail?.bounds) openLookup(detail.word, detail.bounds);
    }
    function dismissOutside(event: PointerEvent) {
      const target = event.target;
      if (target instanceof Node && popupRef.current?.contains(target)) return;
      setSelection(null);
    }
    document.addEventListener("mouseup", inspectSelection);
    document.addEventListener("keyup", inspectSelection);
    document.addEventListener("touchend", inspectSelection);
    window.addEventListener("everlang:dictionary-lookup", handleAutoLookup);
    document.addEventListener("pointerdown", dismissOutside, true);
    return () => {
      document.removeEventListener("mouseup", inspectSelection);
      document.removeEventListener("keyup", inspectSelection);
      document.removeEventListener("touchend", inspectSelection);
      window.removeEventListener(
        "everlang:dictionary-lookup",
        handleAutoLookup,
      );
      document.removeEventListener("pointerdown", dismissOutside, true);
    };
  }, []);

  const selectedWord = selection?.word ?? "";
  useLookup(selectedWord, setLookup, setLookupError);
  if (!selection) return null;
  const dictionaryUrl = `https://krdict.korean.go.kr/kor/dicSearch/SearchView?ParaWordNo=&nation=vie&nationCode=7&mainSearchWord=${encodeURIComponent(selectedWord)}`;
  function speakSelection() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(selectedWord);
    utterance.lang = "ko-KR";
    utterance.rate = 0.82;
    window.speechSynthesis.speak(utterance);
  }
  return (
    <div
      ref={popupRef}
      data-dictionary-popup
      className="fixed z-[60] flex w-[min(360px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border border-indigo-100 bg-white p-3.5 shadow-xl shadow-indigo-950/15"
      style={{
        left: selection.left,
        top: selection.top,
        maxHeight: selection.maxHeight,
      }}
    >
      <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Tra từ / cụm từ · KRdict
          </p>
          <p className="kr-font break-words text-base font-bold text-slate-900">
            {selectedWord}
          </p>
        </div>
        <button
          onClick={() => setSelection(null)}
          className="shrink-0 rounded-md px-2 py-1 text-slate-400 hover:bg-slate-100"
          aria-label="Đóng tra từ"
        >
          ×
        </button>
      </div>
      <div className="flex shrink-0 gap-2">
        <button onClick={speakSelection} className="soft-button flex-1">
          <Volume2 size={15} />
          Nghe phát âm
        </button>
        <a
          href={dictionaryUrl}
          target="_blank"
          rel="noreferrer"
          className="primary-button flex-1"
        >
          <Search size={15} />
          Mở KRdict
        </a>
      </div>
      <div
        className="custom-scroll mt-2 min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1"
        style={{ maxHeight: selection.maxHeight - 100 }}
      >
        {lookupError ? (
          <p className="text-xs text-rose-600">{lookupError}</p>
        ) : null}
        {!lookup ? (
          <p className="text-xs text-slate-500">Đang tra từ điển…</p>
        ) : !lookup.configured ? (
          <p className="text-xs leading-5 text-slate-500">
            KRdict API key chưa được cấu hình. Bạn vẫn có thể mở trang KRdict để
            tra từ hoặc cụm từ.
          </p>
        ) : lookup.items.length ? (
          lookup.items.map((item) => (
            <DictionaryResultCard
              key={`${item.entryType}:${item.id}`}
              item={item}
            />
          ))
        ) : (
          <p className="text-xs text-slate-500">
            KRdict chưa tìm thấy mục từ phù hợp.
          </p>
        )}
      </div>
    </div>
  );
}

const POS_LABELS: Record<string, string> = {
  명사: "Danh từ",
  대명사: "Đại từ",
  수사: "Số từ",
  조사: "Trợ từ",
  동사: "Động từ",
  형용사: "Tính từ",
  관형사: "Định từ",
  부사: "Phó từ",
  감탄사: "Thán từ",
  접사: "Phụ tố",
  "의존 명사": "Danh từ phụ thuộc",
  "보조 동사": "Động từ bổ trợ",
  "보조 형용사": "Tính từ bổ trợ",
  어미: "Vĩ tố",
};
function DictionaryResultCard({ item }: { item: DictionaryEntry }) {
  const level =
    (
      { 초급: "Sơ cấp", 중급: "Trung cấp", 고급: "Cao cấp" } as Record<
        string,
        string
      >
    )[item.level] ?? item.level;
  return (
    <article className="rounded-xl bg-slate-50 p-2.5 text-xs">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <a
          href={item.link}
          target="_blank"
          rel="noreferrer"
          className="kr-font text-sm font-bold text-indigo-800 underline decoration-indigo-200"
        >
          {item.word}
        </a>
        {item.pronunciation ? (
          <span className="kr-font text-slate-500">[{item.pronunciation}]</span>
        ) : null}
        <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-800">
          {item.entryType === "idiom" ? "Quán dụng ngữ / thành ngữ" : "Từ vựng"}
        </span>
        {item.pos ? (
          <span className="text-[10px] text-slate-500">
            {POS_LABELS[item.pos] ?? item.pos}
          </span>
        ) : null}
        {level ? (
          <span className="text-[10px] text-slate-400">{level}</span>
        ) : null}
      </div>
      {item.senses.map((sense, index) => (
        <div
          key={index}
          className="mt-2 border-t border-slate-200 pt-1.5 leading-5"
        >
          <p className="mb-0.5 text-[10px] font-bold text-slate-400">
            Nghĩa {index + 1}
          </p>
          {sense.translations.length ? (
            sense.translations.map((translation, translationIndex) => (
              <p key={translationIndex} className="text-slate-700">
                <b>{translation.word}</b>
                {translation.word && translation.definition ? " — " : ""}
                {translation.definition}
              </p>
            ))
          ) : (
            <p className="text-slate-700">{sense.definition}</p>
          )}
          {sense.translations.length && sense.definition ? (
            <p className="mt-0.5 text-[10px] text-slate-400">
              {sense.definition}
            </p>
          ) : null}
        </div>
      ))}
    </article>
  );
}

function useLookup(
  word: string,
  setLookup: (value: DictionaryLookup | null) => void,
  setError: (value: string) => void,
) {
  useEffect(() => {
    if (!word) return;
    const controller = new AbortController();
    setLookup(null);
    setError("");
    fetch(`/api/dictionary?q=${encodeURIComponent(word)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(
            apiErrorMessage(response, data.error, "Lỗi tra cứu."),
          );
        return data;
      })
      .then(setLookup)
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setError(error instanceof Error ? error.message : "Lỗi tra cứu.");
      });
    return () => controller.abort();
  }, [word, setLookup, setError]);
}
