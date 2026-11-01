"use client";
import { apiFetch } from "@/lib/auth";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/auth";
import { authErrorMessage } from "@/lib/auth-errors";
function Form() {
  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "reset">(
    "login",
  );
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [google, setGoogle] = useState(false);
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const oauthError = params.get("error");
  const oauthMessage = authErrorMessage(oauthError);
  useEffect(() => {
    apiFetch("/api/config")
      .then((r) => r.json())
      .then((p) => setGoogle(p.google))
      .catch(() => setGoogle(false));
  }, []);
  const current = token ? "reset" : mode;
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setNotice("");
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") || "");
    const password = String(f.get("password") || "");
    try {
      const result =
        current === "signup"
          ? await auth.signUp.email({
              email,
              password,
              name: String(f.get("name")),
              callbackURL: "/",
            })
          : current === "forgot"
            ? await auth.requestPasswordReset({
                email,
                redirectTo: "/sign-in",
              })
            : current === "reset"
              ? await auth.resetPassword({
                  newPassword: password,
                  token: token!,
                })
              : await auth.signIn.email({ email, password });
      if (result.error)
        throw new Error(result.error.message || "Không thể đăng nhập");
      if (current === "login") {
        router.push("/");
        router.refresh();
      } else
        setNotice(
          current === "signup"
            ? "Kiểm tra email để xác minh tài khoản."
            : current === "forgot"
              ? "Nếu email hợp lệ, hướng dẫn đặt lại mật khẩu sẽ được gửi."
              : "Đã đặt lại mật khẩu. Bạn có thể đăng nhập.",
        );
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Không thể thực hiện");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-layout page">
      <section className="auth-story">
        <p className="eyebrow">EVERY DAY. EVERY LANGUAGE.</p>
        <h1>
          Một chút hôm nay.
          <br />
          <span>Tiến bộ dài lâu.</span>
        </h1>
        <p>
          Không chỉ biết mình sai ở đâu.
          <br />
          Hiểu cách sửa, và nhớ để lần sau làm tốt hơn.
        </p>
        <div className="learning-art" aria-hidden="true">
          <span className="art-circle">한</span>
          <span className="art-note">
            오늘도 한 걸음
            <br />
            <small>Mỗi ngày một bước</small>
          </span>
          <span className="art-caption">LEARN AT YOUR OWN PACE</span>
        </div>
      </section>
      <section className="panel auth-panel">
        <p className="eyebrow">CHÀO MỪNG ĐẾN EVERLANG</p>
        <h2>
          {current === "signup"
            ? "Tạo tài khoản"
            : current === "forgot"
              ? "Quên mật khẩu"
              : current === "reset"
                ? "Đặt mật khẩu mới"
                : "Tiếp tục hành trình"}
        </h2>
        <p className="muted">Đăng nhập hoặc tạo tài khoản để bắt đầu học.</p>
        {
          <>
            <button
              className="soft-button full"
              disabled={!google || busy}
              onClick={async () => {
                setBusy(true);
                setNotice("");
                try {
                  const result = await auth.signIn.social({
                    provider: "google",
                    callbackURL: "/",
                    errorCallbackURL: "/sign-in",
                  });
                  if (result.error)
                    setNotice(
                      result.error.message ||
                        "Không kết nối được Google. Hãy thử lại.",
                    );
                } catch {
                  setNotice("Không kết nối được Google. Hãy thử lại.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Đăng nhập với Google
            </button>
            {!google && (
              <p className="muted small" role="status">
                Đăng nhập Google tạm thời chưa sẵn sàng.
              </p>
            )}
            <div className="divider">hoặc dùng email</div>
          </>
        }
        <form onSubmit={submit} className="form-stack">
          {current === "signup" && (
            <label>
              Tên của bạn
              <input name="name" required maxLength={80} autoComplete="name" />
            </label>
          )}
          {current !== "reset" && (
            <label>
              Email
              <input name="email" type="email" required autoComplete="email" />
            </label>
          )}
          {current !== "forgot" && (
            <label>
              Mật khẩu
              <input
                name="password"
                type="password"
                minLength={10}
                maxLength={128}
                required
                autoComplete={
                  current === "login" ? "current-password" : "new-password"
                }
              />
            </label>
          )}
          <button className="primary-button full" disabled={busy}>
            {busy
              ? "Đang xử lý…"
              : current === "signup"
                ? "Đăng ký"
                : current === "forgot"
                  ? "Gửi hướng dẫn"
                  : current === "reset"
                    ? "Lưu mật khẩu"
                    : "Đăng nhập →"}
          </button>
        </form>
        {(notice || oauthMessage) && (
          <p role="status" className="notice">
            {notice || oauthMessage}
          </p>
        )}
        {params.get("error") && (
          <p role="alert" className="notice">
            Không hoàn tất đăng nhập. Hãy thử lại hoặc đăng nhập bằng email rồi
            liên kết Google trong Cài đặt nếu tài khoản đã tồn tại.
          </p>
        )}
        <div className="auth-actions">
          <button
            onClick={() => {
              setMode(current === "signup" ? "login" : "signup");
              setNotice("");
            }}
          >
            {current === "signup"
              ? "Đã có tài khoản? Đăng nhập"
              : "Chưa có tài khoản? Đăng ký"}
          </button>
          <button
            onClick={() => {
              setMode("forgot");
              setNotice("");
            }}
          >
            Quên mật khẩu?
          </button>
        </div>
      </section>
    </div>
  );
}
export default function SignIn() {
  return (
    <Suspense fallback={<p className="page">Đang tải…</p>}>
      <Form />
    </Suspense>
  );
}
