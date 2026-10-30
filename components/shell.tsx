"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  Layers,
  UserRound,
  LogOut,
  Settings2,
  Headphones,
  GraduationCap,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
export function Shell({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
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
          {session ? (
            <>
              <Link href="/profile" className="user-link">
                <UserRound size={16} />
                <span>{session.user.name}</span>
              </Link>
              <button
                aria-label="Đăng xuất"
                className="icon-button"
                onClick={async () => {
                  await authClient.signOut();
                  router.push("/sign-in");
                  router.refresh();
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
      {!authPage && !isPending && !session ? (
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
