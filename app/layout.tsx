import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Luyện Dịch Việt – Hàn | TOPIK 4–6",
  description: "Nền tảng luyện dịch tiếng Hàn với chấm bài và góp ý AI.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi"><body>{children}</body></html>
  );
}
