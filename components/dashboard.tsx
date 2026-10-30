"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  Flame,
  Layers,
  RefreshCw,
} from "lucide-react";
import { request } from "@/lib/client";
import type { DailyTask } from "@/lib/learning/schedule";
type Data = {
  profile: { minutes: number; goal: string };
  plan: {
    day: string;
    version: number;
    tasks: DailyTask[];
    completed: boolean;
  };
  dueCount: number;
  streak: number;
  stats: { totalCompleted: number; averageScore: number };
  errors: {
    id: string;
    snapshot: { viText: string };
    report: {
      grammarErrors: {
        error: string;
        correction: string;
        explanation: string;
      }[];
    };
  }[];
};
export default function Dashboard() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(
    () =>
      request<Data>("/api/dashboard")
        .then(setData)
        .catch((e) => setError(e.message)),
    [],
  );
  useEffect(() => {
    void load();
  }, [load]);
  async function change(taskId: string, action: string) {
    if (!data) return;
    setBusy(true);
    try {
      await request("/api/dashboard", "PATCH", {
        day: data.plan.day,
        version: data.plan.version,
        taskId,
        action,
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
      await load();
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">HÀNH TRÌNH TIẾNG HÀN CỦA BẠN</p>
          <h1>
            Hôm nay, học
            <br />
            <span>thêm một điều mới.</span>
          </h1>
          <p className="muted">
            {data
              ? `${data.profile.minutes} phút dành cho mục tiêu: ${data.profile.goal}`
              : "Luyện đều một chút, ghi nhớ nhiều hơn."}
          </p>
          <Link className="primary-button" href="/practice">
            Bắt đầu luyện dịch <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="study-preview">
            <div className="study-preview-label">
              <span className="preview-dot" /> MỖI NGÀY MỘT CHÚT
            </div>
            <div className="study-word">꾸준히</div>
            <p>Đều đặn. Bền bỉ. Tiến bộ.</p>
            <div className="study-preview-footer">
              <BookOpen size={16} />
              <span>Kiến thức nhỏ, hành trình dài</span>
            </div>
          </div>
        </div>
      </section>
      {error && (
        <p role="alert" className="notice">
          {error}
        </p>
      )}
      <section className="stats-grid">
        {[
          [Flame, data?.streak || 0, "ngày học liên tiếp"],
          [Layers, data?.dueCount || 0, "thẻ đến hạn ôn"],
          [BookOpen, data?.stats.totalCompleted || 0, "bài đã luyện"],
          [Check, data?.stats.averageScore || 0, "điểm trung bình"],
        ].map(([Icon, value, label]) => {
          const I = Icon as typeof Flame;
          return (
            <div className="stat-card" key={String(label)}>
              <I size={20} />
              <strong>{String(value)}</strong>
              <span>{String(label)}</span>
            </div>
          );
        })}
      </section>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">DÀNH RIÊNG CHO BẠN</p>
              <h2>Lịch học hôm nay</h2>
            </div>
            <span className="tag yellow">{data?.plan.day || "Đang tải"}</span>
          </div>
          {data?.plan.completed && (
            <p className="success-note">
              Đã hoàn thành mục tiêu hôm nay. Hẹn gặp lại ngày mai!
            </p>
          )}
          {!data && !error && <p className="muted">Đang chuẩn bị lịch học…</p>}
          {data?.plan.tasks.length === 0 && (
            <p className="muted">
              Bạn đã hoàn thành kho bài hiện tại. Thêm từ vào SRS hoặc luyện lại
              một chủ đề yêu thích.
            </p>
          )}
          {data?.plan.tasks.map((t, i) => (
            <article
              className={`task ${t.status !== "pending" ? "task-finished" : ""}`}
              key={t.id}
            >
              <span className="task-number">
                {t.status === "done" ? (
                  <Check size={18} />
                ) : (
                  String(i + 1).padStart(2, "0")
                )}
              </span>
              <div className="task-content">
                <h3>{t.title}</h3>
                <p>{t.reason}</p>
                <span className="muted">
                  {t.minutes} phút ·{" "}
                  {t.status === "skipped"
                    ? "Đã bỏ qua"
                    : t.status === "done"
                      ? "Đã xong"
                      : "Chưa hoàn thành"}
                </span>
                <div className="task-actions">
                  <Link
                    href={
                      t.type === "review"
                        ? "/vocabulary?review=true"
                        : t.type === "weak"
                          ? "/practice?topic=" +
                            encodeURIComponent(
                              t.title.replace("Luyện thêm: ", ""),
                            )
                          : "/practice" +
                            (t.target ? "?sentence=" + t.target : "")
                    }
                  >
                    Vào học →
                  </Link>
                  <button
                    disabled={busy}
                    onClick={() =>
                      void change(
                        t.id,
                        t.status === "done" ? "pending" : "done",
                      )
                    }
                  >
                    {t.status === "done" ? "Học lại" : "Đánh dấu xong"}
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => void change(t.id, "skipped")}
                  >
                    Bỏ qua
                  </button>
                  {t.type !== "review" && (
                    <button
                      aria-label="Đổi bài"
                      disabled={busy}
                      onClick={() => void change(t.id, "replace")}
                    >
                      <RefreshCw size={13} />
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
          {Boolean(data?.dueCount) && (
            <p className="muted small">
              Có {data?.dueCount} thẻ đến hạn. Lịch hôm nay giới hạn theo thời
              gian bạn chọn; số thẻ còn lại vẫn được giữ.
            </p>
          )}
        </section>
        <aside className="panel notebook">
          <p className="eyebrow">BIẾN LỖI SAI THÀNH KIẾN THỨC</p>
          <h2>Sổ tay của bạn</h2>
          <p>Những lỗi gần đây, để lần sau viết tốt hơn.</p>
          {data?.errors.length ? (
            data.errors.slice(0, 4).map((e) => (
              <div className="error-note" key={e.id}>
                {e.report.grammarErrors.slice(0, 2).map((g, i) => (
                  <div key={i}>
                    <del>{g.error}</del>
                    <strong>{g.correction}</strong>
                    <p>{g.explanation}</p>
                    <Link
                      href={
                        "/vocabulary?term=" +
                        encodeURIComponent(g.correction) +
                        "&meaning=" +
                        encodeURIComponent(g.explanation) +
                        "&kind=grammar"
                      }
                    >
                      Lưu để ôn →
                    </Link>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="empty-note">
              ✦
              <p>
                Lỗi sai được AI chỉ ra sẽ xuất hiện ở đây sau khi bạn luyện
                dịch.
              </p>
            </div>
          )}
          <Link href="/vocabulary" className="soft-button">
            Mở kho từ & SRS →
          </Link>
        </aside>
      </div>
    </main>
  );
}
