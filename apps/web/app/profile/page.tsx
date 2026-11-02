"use client";
import { useConfirmation } from "@/components/confirmation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Globe2,
  Pencil,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { request } from "@/lib/client";
import { auth, useAuth } from "@/lib/auth";
import { UserAvatar } from "@/components/user-avatar";
import type { ProfileResponse } from "@everlang/contracts/profile";
import "./profile.css";

export default function Profile() {
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [retry, setRetry] = useState(0);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const { refetch } = useAuth();
  const nameInput = useRef<HTMLInputElement>(null);
  const editButton = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);
  useEffect(() => {
    if (editing) nameInput.current?.focus();
    else if (returnFocus.current) {
      editButton.current?.focus();
      returnFocus.current = false;
    }
  }, [editing]);
  useEffect(() => {
    let active = true;
    request<ProfileResponse>("/api/profile")
      .then((value) => {
        if (active) {
          setData(value);
          setLoadError("");
        }
      })
      .catch((error) => {
        if (active) setLoadError(error.message);
      });
    return () => {
      active = false;
    };
  }, [retry]);
  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setSaveError("");
    setMessage("");
    try {
      await request("/api/profile", "PUT", {
        name: form.get("name"),
        level: form.get("level"),
        goal: form.get("goal"),
        minutes: Number(form.get("minutes")),
        timezone: form.get("timezone"),
      });
      const fresh = await request<ProfileResponse>("/api/profile");
      setData(fresh);
      await refetch({ query: { disableCookieCache: true } });
      setEditing(false);
      setMessage(
        "Đã lưu. Thời gian và mục tiêu mới áp dụng cho lịch ngày tiếp theo.",
      );
    } catch (error) {
      setSaveError((error as Error).message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <main className="page profile-page">
      <header className="profile-page-heading">
        <div>
          <p className="eyebrow">EVERLANG / KHÔNG GIAN CỦA BẠN</p>
          <h1 className="page-title">
            Hồ sơ học tập<span aria-hidden="true">.</span>
          </h1>
        </div>
        <span className="profile-edition" aria-hidden="true">
          YOUR OWN PACE / 나의 배움
        </span>
      </header>
      {!data && !loadError && (
        <p className="profile-loading" role="status">
          Đang tải hồ sơ…
        </p>
      )}
      {loadError && (
        <div className="notice" role="alert">
          {loadError}{" "}
          <button
            className="soft-button"
            onClick={() => {
              setLoadError("");
              setRetry((value) => value + 1);
            }}
          >
            Thử lại
          </button>
        </div>
      )}
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      {data && (
        <div className="profile-layout">
          <aside className="profile-sidebar" aria-label="Danh tính người học">
            <section className="profile-passport">
              <div className="profile-passport-top">
                <span>LEARNER PROFILE</span>
                <span aria-hidden="true">↗</span>
              </div>
              <div className="profile-avatar-frame">
                <UserAvatar
                  name={data.user.name}
                  image={data.user.image}
                  large
                />
              </div>
              <p className="profile-passport-label">XIN CHÀO,</p>
              <h2>{data.user.name}</h2>
              <p className="profile-email">{data.user.email}</p>
              <div className="profile-passport-language">
                <span aria-hidden="true">한</span>
                <div>
                  <strong>Tiếng Hàn</strong>
                  <small>{data.profile.level}</small>
                </div>
              </div>
              <div className="profile-passport-status">
                <Check size={15} aria-hidden="true" />
                <span>
                  {data.user.emailVerified
                    ? "Email đã xác minh"
                    : "Email chưa xác minh"}
                </span>
              </div>
            </section>
            <div className="profile-sidebar-note">
              <span className="eyebrow">MỘT HÀNH TRÌNH RIÊNG</span>
              <p>
                Mục tiêu của bạn.
                <br />
                Nhịp học của bạn.
                <br />
                <strong>Tiến bộ theo cách của bạn.</strong>
              </p>
            </div>
            <Link className="profile-return-link" href="/">
              Về lịch học hôm nay <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </aside>
          <div className="profile-main">
            <section
              className="profile-study"
              aria-labelledby={
                editing ? "profile-edit-title" : "profile-view-title"
              }
            >
              <div className="profile-section-heading">
                <div>
                  <p className="eyebrow">01 / ĐỊNH HƯỚNG HỌC TẬP</p>
                  <h2
                    id={editing ? "profile-edit-title" : "profile-view-title"}
                  >
                    {editing ? "Thiết kế nhịp học" : "Điều bạn đang hướng tới"}
                  </h2>
                </div>
                {!editing && (
                  <button
                    ref={editButton}
                    className="soft-button"
                    onClick={() => {
                      setMessage("");
                      setSaveError("");
                      returnFocus.current = true;
                      setEditing(true);
                    }}
                  >
                    <Pencil size={15} aria-hidden="true" />
                    Chỉnh sửa hồ sơ
                  </button>
                )}
              </div>
              {editing ? (
                <form
                  className="form-stack profile-editor"
                  onSubmit={saveProfile}
                  aria-labelledby="profile-edit-title"
                  aria-busy={saving}
                >
                  <p className="muted">
                    Một kế hoạch vừa sức sẽ giúp bạn đi xa hơn. Thay đổi chỉ áp
                    dụng khi bạn lưu.
                  </p>
                  <fieldset disabled={saving} className="profile-field-grid">
                    <label>
                      Tên
                      <input
                        ref={nameInput}
                        name="name"
                        required
                        maxLength={80}
                        autoComplete="name"
                        defaultValue={data.user.name}
                      />
                    </label>
                    <label>
                      Trình độ
                      <select name="level" defaultValue={data.profile.level}>
                        <option>Trung cấp</option>
                        <option>Cao cấp</option>
                      </select>
                    </label>
                    <label className="profile-field-wide">
                      Mục tiêu
                      <textarea
                        name="goal"
                        required
                        maxLength={300}
                        rows={2}
                        defaultValue={data.profile.goal}
                        aria-describedby="profile-goal-hint"
                      />
                      <span
                        className="profile-field-hint"
                        id="profile-goal-hint"
                      >
                        Bạn muốn dùng tiếng Hàn để làm điều gì? Tối đa 300 ký
                        tự.
                      </span>
                    </label>
                    <label>
                      Số phút học mỗi ngày
                      <div className="profile-input-unit">
                        <input
                          name="minutes"
                          type="number"
                          required
                          min={5}
                          max={120}
                          defaultValue={data.profile.minutes}
                        />
                        <span aria-hidden="true">phút / ngày</span>
                      </div>
                    </label>
                    <label>
                      Múi giờ
                      <input
                        name="timezone"
                        required
                        maxLength={100}
                        defaultValue={data.profile.timezone}
                        aria-describedby="profile-timezone-hint"
                      />
                      <span
                        className="profile-field-hint"
                        id="profile-timezone-hint"
                      >
                        Ví dụ: Asia/Ho_Chi_Minh
                      </span>
                    </label>
                  </fieldset>
                  {saveError && (
                    <p className="profile-save-error" role="alert">
                      {saveError}
                    </p>
                  )}
                  <div className="profile-editor-footer">
                    <p>Lịch đã tạo trong hôm nay được giữ nguyên.</p>
                    <div>
                      <button
                        type="button"
                        className="soft-button"
                        disabled={saving}
                        onClick={() => {
                          setEditing(false);
                          setSaveError("");
                        }}
                      >
                        Hủy thay đổi
                      </button>
                      <button
                        type="submit"
                        className="primary-button"
                        disabled={saving}
                      >
                        {saving ? "Đang lưu…" : "Lưu cài đặt"}
                        <Check size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <>
                  <p className="profile-goal">{data.profile.goal}</p>
                  <div className="profile-rhythm">
                    <div className="profile-minutes">
                      <span>{data.profile.minutes}</span>
                      <span>
                        PHÚT
                        <br />
                        MỖI NGÀY
                      </span>
                    </div>
                    <div className="profile-rhythm-copy">
                      <strong>Đều đặn hơn. Bền vững hơn.</strong>
                      <p>
                        Ngân sách thời gian để EverLang sắp xếp lịch học phù hợp
                        với bạn.
                      </p>
                    </div>
                  </div>
                  <dl className="profile-facts">
                    <div>
                      <dt>TRÌNH ĐỘ HIỆN TẠI</dt>
                      <dd>{data.profile.level}</dd>
                    </div>
                    <div>
                      <dt>
                        <Globe2 size={13} aria-hidden="true" />
                        MÚI GIỜ HỌC TẬP
                      </dt>
                      <dd>{data.profile.timezone}</dd>
                    </div>
                  </dl>
                </>
              )}
            </section>
            <details className="profile-disclosure">
              <summary>
                <ShieldCheck size={20} aria-hidden="true" />
                <span>
                  <strong>Bảo mật & đăng nhập</strong>
                  <small>
                    {data.providers.includes("google")
                      ? "Đã liên kết Google"
                      : "Đăng nhập bằng email"}{" "}
                    · Quản lý phương thức truy cập
                  </small>
                </span>
                <ChevronDown size={18} aria-hidden="true" />
              </summary>
              <div className="profile-disclosure-content">
                <AccountSecurity data={data} />
              </div>
            </details>
            <details className="profile-disclosure">
              <summary>
                <Upload size={20} aria-hidden="true" />
                <span>
                  <strong>Dữ liệu trên thiết bị</strong>
                  <small>Nhập nháp cũ vào tài khoản của bạn</small>
                </span>
                <ChevronDown size={18} aria-hidden="true" />
              </summary>
              <div className="profile-disclosure-content">
                <LegacyDraftImport onMessage={setMessage} />
              </div>
            </details>
            {data.user.admin && (
              <Link className="profile-admin-link" href="/admin">
                Không gian quản trị học liệu{" "}
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function AccountSecurity({ data }: { data: ProfileResponse }) {
  const [securityBusy, setSecurityBusy] = useState(false);
  const [message, onMessage] = useState("");
  return (
    <div className="profile-security-content">
      {data.providers.includes("google") ? (
        <p className="muted">Google đã được liên kết với tài khoản này.</p>
      ) : data.googleEnabled ? (
        <button
          className="soft-button"
          disabled={securityBusy}
          onClick={async () => {
            setSecurityBusy(true);
            try {
              const p = await auth.linkSocial({
                provider: "google",
                callbackURL: "/profile",
                errorCallbackURL: "/sign-in",
              });
              if (p.error) onMessage(p.error.message || "Không liên kết được");
            } catch {
              onMessage("Không kết nối được Google. Hãy thử lại.");
            } finally {
              setSecurityBusy(false);
            }
          }}
        >
          Liên kết Google
        </button>
      ) : (
        <p className="muted">
          Đăng nhập Google sẽ được bật khi hoàn tất cấu hình OAuth.
        </p>
      )}
      {data.providers.includes("credential") ? (
        <form
          className="form-stack"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            setSecurityBusy(true);
            const f = new FormData(e.currentTarget);
            try {
              const p = await auth.changePassword({
                currentPassword: String(f.get("current")),
                newPassword: String(f.get("next")),
                revokeOtherSessions: true,
              });
              onMessage(
                p.error?.message ||
                  "Đã đổi mật khẩu và đăng xuất các phiên khác.",
              );
              if (!p.error) form.reset();
            } catch {
              onMessage("Không đổi được mật khẩu. Hãy thử lại.");
            } finally {
              setSecurityBusy(false);
            }
          }}
        >
          <label>
            Mật khẩu hiện tại
            <input
              name="current"
              type="password"
              required
              autoComplete="current-password"
            />
          </label>
          <label>
            Mật khẩu mới
            <input
              name="next"
              type="password"
              minLength={10}
              maxLength={128}
              required
              autoComplete="new-password"
            />
          </label>
          <button className="soft-button" disabled={securityBusy}>
            Đổi mật khẩu
          </button>
        </form>
      ) : (
        <div className="form-stack">
          <p className="muted">
            Bạn đang dùng Google và chưa đặt mật khẩu EverLang. Có thể tạo mật
            khẩu qua email xác minh.
          </p>
          <button
            className="soft-button"
            disabled={securityBusy}
            onClick={async () => {
              setSecurityBusy(true);
              try {
                const result = await auth.requestPasswordReset({
                  email: data.user.email,
                  redirectTo: "/sign-in",
                });
                onMessage(
                  result.error?.message ||
                    "Đã yêu cầu hướng dẫn tạo mật khẩu qua email.",
                );
              } catch {
                onMessage("Không gửi được email. Hãy thử lại sau.");
              } finally {
                setSecurityBusy(false);
              }
            }}
          >
            Gửi email tạo mật khẩu
          </button>
        </div>
      )}

      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
function LegacyDraftImport({ onMessage }: { onMessage: (s: string) => void }) {
  const confirm = useConfirmation();
  const [importing, setImporting] = useState(false);
  return (
    <div className="profile-import-content">
      <p className="muted">
        Chỉ nhập nháp chưa có trên tài khoản. Lịch sử chấm cũ được nhập riêng
        bởi quản trị viên.
      </p>
      <button
        className="soft-button"
        disabled={importing}
        onClick={async () => {
          if (importing) return;
          if (
            !(await confirm({ message: "Nhập nháp cũ trên thiết bị này vào tài khoản đang đăng nhập?", confirmLabel: "Nhập nháp" }))
          )
            return;
          setImporting(true);
          try {
            const id = localStorage.getItem("kr-practice-user-id");
            const old = JSON.parse(
              localStorage.getItem("kr-practice-drafts-" + id) || "{}",
            );
            let count = 0;
            for (const [sentenceId, text] of Object.entries(old)) {
              try {
                await request("/api/drafts", "PUT", {
                  sentenceId,
                  text,
                  version: 0,
                });
                count++;
              } catch {
                /* Existing cloud drafts are deliberately preserved. */
              }
            }
            onMessage(
              `Đã nhập ${count} nháp; giữ nguyên nháp đã có trên tài khoản.`,
            );
          } catch {
            onMessage("Không đọc được nháp cũ.");
          } finally {
            setImporting(false);
          }
        }}
      >
        Xác nhận nhập nháp từ máy này
      </button>
    </div>
  );
}
