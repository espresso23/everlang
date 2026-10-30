"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { request } from "@/lib/client";
import { authClient } from "@/lib/auth-client";
import { UserAvatar } from "@/components/user-avatar";
import type { ProfileResponse } from "@/lib/profile";
export default function Profile() {
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState("");
  const [retry, setRetry] = useState(0);
  const [saving, setSaving] = useState(false);
  const [securityBusy, setSecurityBusy] = useState(false);
  const { refetch } = authClient.useSession();
  useEffect(() => {
    let active = true;
    request<ProfileResponse>("/api/profile")
      .then(value => { if (active) { setData(value); setLoadError(""); } })
      .catch((e) => { if (active) setLoadError(e.message); });
    return () => { active = false; };
  }, [retry]);
  return (
    <main className="page narrow">
      <p className="eyebrow">HỌC THEO NHỊP CỦA BẠN</p>
      <h1 className="page-title">Hồ sơ & cài đặt</h1>
      {!data && !loadError && <p role="status">Đang tải hồ sơ…</p>}
      {loadError && <div className="notice" role="alert">{loadError}
        <button className="soft-button" onClick={() => { setLoadError(""); setRetry(value => value + 1); }}>Thử lại</button>
      </div>}
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      {data && (
        <>
          <section className="panel profile-identity">
            <UserAvatar name={data.user.name} image={data.user.image} large />
            <div>
              <h2>{data.user.name}</h2>
              <p className="muted">{data.user.email}</p>
              <p className="small">{data.user.emailVerified ? "Email đã xác minh" : "Email chưa xác minh"}
                {" · "}{data.providers.includes("google") ? "Đã liên kết Google" : "Tài khoản email"}</p>
            </div>
          </section>
          <section className="panel spaced">
            <h2>Mục tiêu học tập</h2>
            <p className="muted">{data.user.email}</p>
            <form
              className="form-stack"
              onSubmit={async (e) => {
                e.preventDefault();
                setSaving(true);
                setMessage("");
                const f = new FormData(e.currentTarget);
                try {
                  await request("/api/profile", "PUT", {
                    name: f.get("name"),
                    level: f.get("level"),
                    goal: f.get("goal"),
                    minutes: Number(f.get("minutes")),
                    timezone: f.get("timezone"),
                  });
                  const fresh = await request<ProfileResponse>("/api/profile");
                  setData(fresh);
                  await refetch({ query: { disableCookieCache: true } });
                  setMessage(
                    "Đã lưu. Thời gian và mục tiêu mới áp dụng cho lịch ngày tiếp theo.",
                  );
                } catch (e) {
                  setMessage((e as Error).message);
                } finally { setSaving(false); }
              }}
            >
              <label>
                Tên
                <input name="name" required maxLength={80} autoComplete="name" defaultValue={data.user.name} />
              </label>
              <label>
                Trình độ
                <select name="level" defaultValue={data.profile.level}>
                  <option>Trung cấp</option>
                  <option>Cao cấp</option>
                </select>
              </label>
              <label>
                Mục tiêu
                <input
                  name="goal"
                  required
                  maxLength={300}
                  defaultValue={data.profile.goal}
                />
              </label>
              <label>
                Số phút học mỗi ngày
                <input
                  name="minutes"
                  type="number"
                  min={5}
                  max={120}
                  defaultValue={data.profile.minutes}
                />
              </label>
              <label>
                Múi giờ
                <input
                  name="timezone"
                  required
                  defaultValue={data.profile.timezone}
                />
              </label>
              <button className="primary-button" disabled={saving}>{saving ? "Đang lưu…" : "Lưu cài đặt"}</button>
            </form>
          </section>
          <section className="panel spaced">
            <h2>Bảo mật tài khoản</h2>
            {data.providers.includes("google") ? <p className="muted">Google đã được liên kết với tài khoản này.</p> : data.googleEnabled ? (
              <button
                className="soft-button"
                disabled={securityBusy}
                onClick={async () => {
                  setSecurityBusy(true);
                  try {
                    const p = await authClient.linkSocial({
                      provider: "google", callbackURL: "/profile", errorCallbackURL: "/sign-in",
                    });
                    if (p.error) setMessage(p.error.message || "Không liên kết được");
                  } catch { setMessage("Không kết nối được Google. Hãy thử lại."); }
                  finally { setSecurityBusy(false); }
                }}
              >
                Liên kết Google
              </button>
            ) : (
              <p className="muted">
                Đăng nhập Google sẽ được bật khi hoàn tất cấu hình OAuth.
              </p>
            )}
            {data.providers.includes("credential") ? <form
              className="form-stack"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                setSecurityBusy(true);
                const f = new FormData(e.currentTarget);
                try {
                const p = await authClient.changePassword({
                  currentPassword: String(f.get("current")),
                  newPassword: String(f.get("next")),
                  revokeOtherSessions: true,
                });
                setMessage(
                  p.error?.message ||
                    "Đã đổi mật khẩu và đăng xuất các phiên khác.",
                );
                if (!p.error) form.reset();
                } catch { setMessage("Không đổi được mật khẩu. Hãy thử lại."); }
                finally { setSecurityBusy(false); }
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
              <button className="soft-button" disabled={securityBusy}>Đổi mật khẩu</button>
            </form> : <div className="form-stack">
              <p className="muted">Bạn đang dùng Google và chưa đặt mật khẩu EverLang. Có thể tạo mật khẩu qua email xác minh.</p>
              <button className="soft-button" disabled={securityBusy} onClick={async () => {
                setSecurityBusy(true);
                try {
                  const result = await authClient.requestPasswordReset({ email: data.user.email, redirectTo: "/sign-in" });
                  setMessage(result.error?.message || "Đã yêu cầu hướng dẫn tạo mật khẩu qua email.");
                } catch { setMessage("Không gửi được email. Hãy thử lại sau."); }
                finally { setSecurityBusy(false); }
              }}>Gửi email tạo mật khẩu</button>
            </div>}
          </section>
          <LegacyDraftImport onMessage={setMessage} />
          {data.user.admin && (
            <Link className="primary-button spaced" href="/admin">
              Quản trị học liệu →
            </Link>
          )}
        </>
      )}
    </main>
  );
}
function LegacyDraftImport({ onMessage }: { onMessage: (s: string) => void }) {
  return (
    <section className="panel spaced">
      <h2>Nhập nháp cũ trên thiết bị</h2>
      <p className="muted">
        Chỉ nhập nháp chưa có trên tài khoản. Lịch sử chấm cũ được nhập riêng
        bởi quản trị viên.
      </p>
      <button
        className="soft-button"
        onClick={async () => {
          if (
            !window.confirm(
              "Nhập nháp cũ trên thiết bị này vào tài khoản đang đăng nhập?",
            )
          )
            return;
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
          }
        }}
      >
        Xác nhận nhập nháp từ máy này
      </button>
    </section>
  );
}
