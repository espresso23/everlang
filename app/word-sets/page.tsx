"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { request } from "@/lib/client";
import { playKorean, stopKorean } from "@/lib/korean-audio";
import {
  catalogTopics,
  type PublicCatalog,
} from "@/lib/vocabulary-catalog-contract";
import "./word-sets.css";

type Summary = {
  key: string;
  revision: number;
  title: string;
  summary: string;
  level: string;
  topics: string[];
  count: number;
};
type Learning = {
  preferences: { new_per_day: number; version: number };
  used: number;
  day: string;
  timezone: string;
  progress: {
    sense_key: string;
    status: string;
    version: number;
    revision: number;
  }[];
  cards: {
    id: string;
    sense_key: string;
    version: number;
    suspended: boolean;
    source_revision: string | null;
  }[];
  legacy: {
    id: string;
    term: string;
    meaning: string;
    kind: string;
    version: number;
  }[];
};
const statuses: Record<string, string> = {
  learning: "Đang học",
  known: "Tự đánh giá: đã biết",
  skipped: "Đã bỏ qua",
  unmarked: "Chưa đánh dấu",
};
function WordSets() {
  const params = useSearchParams();
  const selectedKey = params.get("set") || "";
  const [filters, setFilters] = useState({
    q: "",
    topic: "",
    level: "",
    offset: 0,
  });
  const query = new URLSearchParams({
    ...filters,
    offset: String(filters.offset),
  }).toString();
  const [list, setList] = useState<{
    query: string;
    items: Summary[];
    total: number;
  } | null>(null);
  const [detail, setDetail] = useState<{
    set: PublicCatalog;
    senses: PublicCatalog[];
  } | null>(null);
  const [learning, setLearning] = useState<Learning | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [attachId, setAttachId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [audioBusy, setAudioBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const epoch = useRef({ value: 0 });
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      stopKorean();
    };
  }, []);
  useEffect(() => {
    if (selectedKey) return;
    let live = true;
    request<{ items: Summary[]; total: number }>(`/api/word-sets?${query}`)
      .then((p) => {
        if (live) {
          setList({ ...p, query });
          setError("");
        }
      })
      .catch((e) => {
        if (live) setError(e.message);
      });
    return () => {
      live = false;
    };
  }, [query, selectedKey, reload]);
  useEffect(() => {
    stopKorean();
    const fence = epoch.current;
    const current = ++fence.value;
    if (!selectedKey) return;
    const key = encodeURIComponent(selectedKey);
    // Fetch the set first, then read progress for its exact immutable revision.
    request<{ set: PublicCatalog; senses: PublicCatalog[] }>(
      `/api/word-sets?key=${key}`,
    )
      .then(async (p) => {
        const state = await request<Learning>(
          `/api/word-sets/learn?key=${key}&revision=${p.set.revision}`,
        );
        if (alive.current && current === epoch.current.value) {
          setDetail(p);
          setLearning(state);
          setIndex(0);
          setRevealed(false);
          setAttachId("");
          setError("");
          setNotice("");
          setBusy(false);
        }
      })
      .catch((e) => {
        if (alive.current && current === epoch.current.value) {
          setDetail(null);
          setError(e.message);
          setBusy(false);
        }
      });
    return () => {
      fence.value++;
    };
  }, [selectedKey, reload]);
  const record =
    detail?.set.key === selectedKey ? detail.senses[index] : undefined;
  const sense = record?.content.kind === "sense" ? record.content : null;
  const state = learning?.progress.find((p) => p.sense_key === record?.key);
  const saved = learning?.cards.find((c) => c.sense_key === record?.key);
  async function refreshProgress() {
    if (!detail) return;
    return request<Learning>(
      `/api/word-sets/learn?key=${encodeURIComponent(detail.set.key)}&revision=${detail.set.revision}`,
    );
  }
  async function act(action: "save" | "known" | "skipped" | "reset") {
    if (!detail || !record) return;
    const current = epoch.current.value;
    setBusy(true);
    setNotice("");
    try {
      const attach = learning?.legacy.find((c) => c.id === attachId);
      const result = await request<{ duplicate: boolean }>(
        "/api/word-sets/learn",
        "POST",
        {
          setKey: detail.set.key,
          setRevision: detail.set.revision,
          senseKey: record.key,
          senseRevision: record.revision,
          action,
          version: state?.version || 0,
          ...(action === "save" && attach
            ? { attachCardId: attach.id, attachVersion: attach.version }
            : {}),
        },
      );
      const p = await refreshProgress();
      if (alive.current && current === epoch.current.value && p) {
        setLearning(p);
        setAttachId("");
        setNotice(
          result.duplicate
            ? "Nghĩa này đã có trong SRS. Lịch ôn và ghi chú được giữ nguyên."
            : action === "save"
              ? "Đã lưu nghĩa cụ thể vào SRS."
              : "Đã cập nhật tự đánh giá; lịch SRS vẫn giữ nguyên.",
        );
      }
    } catch (e) {
      if (alive.current && current === epoch.current.value)
        setNotice(
          (e as Error).message + " Bạn có thể tải lại trạng thái để đối chiếu.",
        );
    } finally {
      if (alive.current && current === epoch.current.value) setBusy(false);
    }
  }
  async function savePreferences(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!learning) return;
    const value = Number(new FormData(e.currentTarget).get("newPerDay"));
    const current = epoch.current.value;
    setBusy(true);
    try {
      await request("/api/word-sets/learn", "PUT", {
        newPerDay: value,
        version: learning.preferences.version,
      });
      const p = await refreshProgress();
      if (alive.current && current === epoch.current.value && p) {
        setLearning(p);
        setNotice("Đã lưu mục tiêu từ mới mỗi ngày.");
      }
    } catch (e) {
      if (alive.current && current === epoch.current.value)
        setNotice((e as Error).message);
    } finally {
      if (alive.current && current === epoch.current.value) setBusy(false);
    }
  }
  async function listen(text: string) {
    const current = epoch.current.value;
    setAudioBusy(true);
    setNotice("");
    try {
      await playKorean(text);
    } catch (e) {
      if (alive.current && current === epoch.current.value)
        setNotice((e as Error).message);
    } finally {
      if (alive.current) setAudioBusy(false);
    }
  }
  return (
    <main className="page">
      <Link href="/vocabulary">← Kho từ & SRS</Link>
      <p className="eyebrow">TỪ TRONG NGỮ CẢNH · TỪNG NGHĨA CỤ THỂ</p>
      <h1 className="page-title">Bộ từ theo chủ đề</h1>
      <p className="muted">
        Đời sống, học tập, công việc và chuyên ngành. Số lượng hiển thị là nội
        dung đã xuất bản; thư viện đang được biên soạn và duyệt.
      </p>
      {error && (
        <p className="notice" role="alert">
          {error}{" "}
          <button
            className="text-button"
            onClick={() => setReload((n) => n + 1)}
          >
            Thử tải lại
          </button>
        </p>
      )}
      <p
        className={notice ? "notice" : "sr-only"}
        role="status"
        aria-live="polite"
      >
        {notice}
      </p>
      {!selectedKey ? (
        <>
          <form
            className="catalog-filters panel"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              setFilters({
                q: String(f.get("q") || ""),
                topic: String(f.get("topic") || ""),
                level: String(f.get("level") || ""),
                offset: 0,
              });
            }}
          >
            <label>
              Tìm bộ từ
              <input
                className="control-input"
                name="q"
                maxLength={200}
                placeholder="Tên, chủ đề hoặc từ khóa"
              />
            </label>
            <label>
              Chủ đề
              <select className="control-input" name="topic">
                <option value="">Tất cả</option>
                {catalogTopics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.group} · {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Trình độ
              <select className="control-input" name="level">
                <option value="">Tất cả</option>
                {["Sơ cấp", "Trung cấp", "Cao cấp"].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </label>
            <button className="primary-button">Tìm kiếm</button>
          </form>
          {list?.query !== query ? (
            !error && <p role="status">Đang tải bộ từ…</p>
          ) : (
            <>
              <p className="muted">
                {list.total} bộ phù hợp · Nội dung nháp chỉ có trong trang quản
                trị.
              </p>
              {!list.items.length && (
                <div className="panel">
                  <h2>Chưa có bộ đã xuất bản</h2>
                  <p>
                    Thử chủ đề khác hoặc quay lại sau khi nội dung được duyệt.
                    Bạn vẫn có thể thêm từ riêng vào kho SRS.
                  </p>
                </div>
              )}
              <div className="dashboard-grid">
                {list.items.map((item) => (
                  <article className="panel catalog-card" key={item.key}>
                    <p className="eyebrow">
                      {item.level} · {item.count} nghĩa
                    </p>
                    <h2>{item.title}</h2>
                    <p>{item.summary}</p>
                    <p className="muted small">
                      {item.topics
                        .map(
                          (id) =>
                            catalogTopics.find((t) => t.id === id)?.label || id,
                        )
                        .join(" · ")}
                    </p>
                    <Link
                      className="text-button"
                      href={`/word-sets?set=${encodeURIComponent(item.key)}`}
                    >
                      Mở bộ từ →
                    </Link>
                  </article>
                ))}
              </div>
              <div className="task-actions spaced">
                <button
                  className="soft-button"
                  disabled={!filters.offset}
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      offset: Math.max(0, f.offset - 30),
                    }))
                  }
                >
                  Trang trước
                </button>
                <span>
                  {list.total ? filters.offset + 1 : 0}–
                  {Math.min(filters.offset + 30, list.total)} / {list.total}
                </span>
                <button
                  className="soft-button"
                  disabled={filters.offset + 30 >= list.total}
                  onClick={() =>
                    setFilters((f) => ({ ...f, offset: f.offset + 30 }))
                  }
                >
                  Trang sau
                </button>
              </div>
            </>
          )}
        </>
      ) : detail?.set.key !== selectedKey || !learning ? (
        !error && <p role="status">Đang mở bộ từ và tiến độ…</p>
      ) : (
        <>
          <Link href="/word-sets">← Danh sách bộ từ</Link>
          {detail.set.content.kind === "set" && (
            <section className="panel spaced">
              <h2>{detail.set.content.title}</h2>
              <p>{detail.set.content.summary}</p>
              <p className="muted small">
                Phiên bản {detail.set.revision} · {detail.senses.length} nghĩa ·{" "}
                {detail.set.content.source} · {detail.set.content.rights}
              </p>
            </section>
          )}
          <form
            className="panel catalog-preferences spaced"
            key={learning.preferences.version}
            onSubmit={(e) => void savePreferences(e)}
          >
            <label>
              Từ mới mỗi ngày (0–30)
              <input
                className="control-input"
                name="newPerDay"
                type="number"
                min={0}
                max={30}
                required
                defaultValue={learning.preferences.new_per_day}
                disabled={busy}
              />
            </label>
            <button className="soft-button" disabled={busy}>
              Lưu mục tiêu
            </button>
            <p className="muted small">
              Đã thêm {learning.used}/{learning.preferences.new_per_day} nghĩa
              mới · {learning.day} · {learning.timezone}. Áp dụng chung cho mọi
              bộ; vẫn được đọc khi hết lượt.
            </p>
          </form>
          <div className="catalog-layout spaced">
            <section
              className="panel catalog-index"
              aria-label="Các nghĩa trong bộ"
            >
              <h2>Chọn từ để học</h2>
              {detail.senses.map(
                (s, i) =>
                  s.content.kind === "sense" && (
                    <button
                      className={`catalog-word ${i === index ? "is-current" : ""}`}
                      aria-pressed={i === index}
                      key={s.key}
                      disabled={busy || audioBusy}
                      onClick={() => {
                        setIndex(i);
                        setRevealed(false);
                        setAttachId("");
                        setNotice("");
                      }}
                    >
                      <span lang="ko">{s.content.term}</span>
                      <small lang="ko">{s.content.examples[0].ko}</small>
                      <small>
                        {
                          statuses[
                            learning.progress.find((p) => p.sense_key === s.key)
                              ?.status || "unmarked"
                          ]
                        }
                      </small>
                    </button>
                  ),
              )}
              <Link className="text-button" href="/vocabulary?review=true">
                Ôn thẻ đến hạn →
              </Link>
            </section>
            {sense && record && (
              <article className="panel catalog-lesson">
                <p className="eyebrow">
                  {sense.pos} · {sense.register} · {index + 1}/
                  {detail.senses.length}
                </p>
                <h2 className="catalog-term" lang="ko">
                  {sense.term}
                </h2>
                {(sense.pronunciation || sense.hanja) && (
                  <p lang="ko">
                    {sense.pronunciation && `[${sense.pronunciation}]`}{" "}
                    {sense.hanja}
                  </p>
                )}
                <div className="task-actions">
                  <button
                    className="soft-button"
                    disabled={audioBusy}
                    onClick={() => void listen(sense.term)}
                  >
                    Nghe từ · TTS
                  </button>
                  <Link
                    className="text-button"
                    href={`/speech?reference=${encodeURIComponent(sense.term)}`}
                  >
                    Thu và nghe lại →
                  </Link>
                </div>
                <p className="muted small">
                  Giọng đọc của trình duyệt/hệ thống, chưa phải audio được người
                  duyệt xác nhận.
                </p>
                {!revealed ? (
                  <button
                    className="primary-button spaced"
                    onClick={() => setRevealed(true)}
                  >
                    Nhớ nghĩa rồi mở đáp án
                  </button>
                ) : (
                  <div className="catalog-meaning spaced">
                    <h3>Nghĩa đang học</h3>
                    <p>{sense.meaning}</p>
                    {sense.usage && <p>{sense.usage}</p>}
                    {!!sense.collocations.length && (
                      <>
                        <h3>Cụm thường dùng trong mục này</h3>
                        {sense.collocations.map((c, i) => (
                          <p key={i}>
                            <span lang="ko">{c.ko}</span> — {c.vi}
                          </p>
                        ))}
                      </>
                    )}
                    <h3>Ví dụ</h3>
                    {sense.examples.map((e, i) => (
                      <div className="catalog-example" key={i}>
                        <p lang="ko">{e.ko}</p>
                        <p>{e.vi}</p>
                        <div className="task-actions">
                          <button
                            className="text-button"
                            disabled={audioBusy}
                            onClick={() => void listen(e.ko)}
                          >
                            Nghe câu · TTS
                          </button>
                          <Link
                            className="text-button"
                            href={`/speech?reference=${encodeURIComponent(e.ko.slice(0, 300))}`}
                          >
                            Luyện thu câu →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="muted small">
                  Nguồn: {sense.source} · {sense.rights} · Phiên bản{" "}
                  {record.revision}
                </p>
                {saved && Number(saved.source_revision) !== record.revision && (
                  <p className="notice">
                    Thẻ SRS đang giữ bản v{saved.source_revision || "cũ"}; bài
                    đang mở là v{record.revision}. Lịch ôn và nội dung thẻ không
                    tự đổi. <Link href="/vocabulary">Xem kho từ</Link>
                  </p>
                )}
                {!saved &&
                  learning.legacy.some(
                    (c) =>
                      c.term === sense.term &&
                      c.kind === (sense.pos === "Cụm từ" ? "phrase" : "word"),
                  ) && (
                    <label>
                      Liên kết thẻ nhập tay cùng nghĩa (tùy chọn)
                      <select
                        className="control-input"
                        value={attachId}
                        disabled={busy}
                        onChange={(e) => setAttachId(e.target.value)}
                      >
                        <option value="">Tạo thẻ riêng cho nghĩa này</option>
                        {learning.legacy
                          .filter(
                            (c) =>
                              c.term === sense.term &&
                              c.kind ===
                                (sense.pos === "Cụm từ" ? "phrase" : "word"),
                          )
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.term} — {c.meaning}
                            </option>
                          ))}
                      </select>
                      <span className="muted small">
                        Chỉ chọn khi đúng nghĩa; liên kết giữ nguyên lịch, ID và
                        lịch sử ôn.
                      </span>
                    </label>
                  )}
                <div className="task-actions spaced">
                  <button
                    className="primary-button"
                    disabled={busy}
                    onClick={() => void act("save")}
                  >
                    {saved
                      ? "Đã có trong SRS · giữ lịch"
                      : attachId
                        ? "Liên kết vào thẻ đang có"
                        : "Lưu nghĩa này vào SRS"}
                  </button>
                  <button
                    className="soft-button"
                    disabled={busy}
                    onClick={() => void act("known")}
                  >
                    Tôi đã biết nghĩa này
                  </button>
                  <button
                    className="soft-button"
                    disabled={busy}
                    onClick={() => void act("skipped")}
                  >
                    Bỏ qua
                  </button>
                  <button
                    className="text-button"
                    disabled={busy}
                    onClick={() => void act("reset")}
                  >
                    Bỏ đánh dấu
                  </button>
                </div>
                <p>
                  {statuses[state?.status || "unmarked"]}
                  {saved?.suspended ? " · Thẻ SRS đang tạm dừng" : ""}
                </p>
                <p className="muted small">
                  Tự đánh giá không phải chứng nhận nắm vững và không thay đổi
                  lịch FSRS.
                </p>
                <button
                  className="text-button"
                  disabled={busy}
                  onClick={async () => {
                    const current = epoch.current.value;
                    try {
                      const p = await refreshProgress();
                      if (
                        alive.current &&
                        current === epoch.current.value &&
                        p
                      ) {
                        setLearning(p);
                        setNotice(
                          "Đã tải trạng thái mới; lựa chọn trên trang được giữ.",
                        );
                      }
                    } catch (e) {
                      if (alive.current) setNotice((e as Error).message);
                    }
                  }}
                >
                  Tải lại trạng thái
                </button>
              </article>
            )}
          </div>
        </>
      )}
    </main>
  );
}
export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="page" role="status">
          Đang mở bộ từ…
        </main>
      }
    >
      <WordSets />
    </Suspense>
  );
}
