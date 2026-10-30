"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  Layers,
  LogOut,
  Settings2,
  Headphones,
  GraduationCap,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { UserAvatar } from "@/components/user-avatar";
import { useState } from "react";
export function Shell({ children }: { children: React.ReactNode }) {
  const { data: session, isPending, error, refetch } = authClient.useSession();
  const [logoutError, setLogoutError] = useState("");
  const path = usePathname();
  const router = useRouter();
  const authPage = path === "/sign-in";
  return (
    <>
      <header className="app-header">
        <Link className="brand" href="/">
          <span className="brand-icon" aria-hidden="true">e<span className="brand-spark">✦</span></span>
          EverLang<span className="beta-badge">BETA</span>
        </Link>
        <div className="header-right">
          <span className="language-pill">🇰🇷 Tiếng Hàn</span>
          {isPending ? <span className="muted small" role="status">Đang kiểm tra đăng nhập…</span>
          : error ? <button className="soft-button" onClick={() => void refetch()}>Thử lại kết nối</button>
          : session ? (
            <>
              <Link href="/profile" className="user-link">
                <UserAvatar name={session.user.name} image={session.user.image} />
                <span className="user-name">{session.user.name}</span>
              </Link>
              <button
                aria-label="Đăng xuất"
                className="icon-button"
                onClick={async () => {
                  try {
                    const result = await authClient.signOut();
                    if (result.error) throw new Error("Không thể đăng xuất. Hãy thử lại.");
                    router.push("/sign-in");
                    router.refresh();
                  } catch { setLogoutError("Không thể đăng xuất. Hãy thử lại."); }
                }}
              >
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <Link className="primary-button" href="/sign-in">
              Đăng nhập
            </Link>
          )}
        </div>
      </header>
      {logoutError && <p className="notice" role="alert">{logoutError}</p>}
      {!authPage && (
        <nav className="app-nav" aria-label="Điều hướng chính">
          {[
            ["/", "Hôm nay", CalendarDays],
            ["/practice", "Luyện dịch", BookOpen],
            ["/vocabulary", "Kho từ & SRS", Layers],
            ["/library", "Nghe · Đọc · Nói", Headphones],
            ["/exams", "Luyện thi", GraduationCap],
            ["/profile", "Cài đặt", Settings2],
          ].map(([href, label, Icon]) => {
            const I = Icon as typeof BookOpen;
            return (
              <Link
                key={String(href)}
                href={String(href)}
                className={path === href ? "nav-active" : ""}
              >
                <I size={17} />
                {String(label)}
              </Link>
            );
          })}
        </nav>
      )}
      {!authPage && (isPending || error) ? (
        <main className="page narrow" role="status">
          {isPending ? "Đang kiểm tra đăng nhập…" : "Chưa kết nối được tài khoản. Hãy thử lại kết nối ở trên."}
        </main>
      ) : !authPage && !session ? (
        <section className="page narrow">
          <div className="panel welcome">
            <p className="eyebrow">MỖI NGÀY, MỘT BƯỚC XA HƠN</p>
            <h1>
              Tiếng Hàn của bạn.
              <br />
              Lộ trình của riêng bạn.
            </h1>
            <p className="muted">
              Luyện dịch, hiểu lỗi sai và ghi nhớ lâu hơn cùng EverLang.
            </p>
            <Link href="/sign-in" className="primary-button">
              Bắt đầu học →
            </Link>
          </div>
        </section>
      ) : (
        children
      )}
      <footer className="app-footer">
        EverLang <span>Học để hiểu. Ôn để nhớ.</span>
      </footer>
    </>
  );
}
