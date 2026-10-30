"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { request } from "@/lib/client";
import { authClient } from "@/lib/auth-client";
type Profile = {
  user: { name: string; email: string; admin: boolean };
  profile: { level: string; goal: string; minutes: number; timezone: string };
  googleEnabled: boolean;
};
export default function Profile() {
  const [data, setData] = useState<Profile | null>(null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    request<Profile>("/api/profile")
      .then(setData)
      .catch((e) => setMessage(e.message));
  }, []);
  return (
    <main className="page narrow">
      <p className="eyebrow">HỌC THEO NHỊP CỦA BẠN</p>
      <h1 className="page-title">Hồ sơ & cài đặt</h1>
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      {data && (
        <>
          <section className="panel">
            <h2>Mục tiêu học tập</h2>
            <p className="muted">{data.user.email}</p>
            <form
              className="form-stack"
              onSubmit={async (e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                try {
                  await request("/api/profile", "PUT", {
                    name: f.get("name"),
                    level: f.get("level"),
                    goal: f.get("goal"),
                    minutes: Number(f.get("minutes")),
                    timezone: f.get("timezone"),
                  });
                  setMessage(
                    "Đã lưu. Thời gian và mục tiêu mới áp dụng cho lịch ngày tiếp theo.",
                  );
                } catch (e) {
                  setMessage((e as Error).message);
                }
              }}
            >
              <label>
                Tên
                <input name="name" required defaultValue={data.user.name} />
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
              <button className="primary-button">Lưu cài đặt</button>
            </form>
          </section>
          <section className="panel spaced">
            <h2>Bảo mật tài khoản</h2>
            {data.googleEnabled ? (
              <button
                className="soft-button"
                onClick={async () => {
                  const p = await authClient.linkSocial({
                    provider: "google",
                    callbackURL: "/profile",
                  });
                  if (p.error)
                    setMessage(p.error.message || "Không liên kết được");
                }}
              >
                Liên kết Google
              </button>
            ) : (
              <p className="muted">
                Đăng nhập Google sẽ được bật khi hoàn tất cấu hình OAuth.
              </p>
            )}
            <form
              className="form-stack"
              onSubmit={async (e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                const p = await authClient.changePassword({
                  currentPassword: String(f.get("current")),
                  newPassword: String(f.get("next")),
                  revokeOtherSessions: true,
                });
                setMessage(
                  p.error?.message ||
                    "Đã đổi mật khẩu và đăng xuất các phiên khác.",
                );
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
              <button className="soft-button">Đổi mật khẩu</button>
            </form>
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
