import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import "./editorial.css";
import { AuthProvider } from "@/lib/auth";
import { Shell } from "@/components/shell";

export const metadata: Metadata = {
  title: "EverLang | Tự học tiếng Hàn mỗi ngày",
  description:
    "Luyện dịch, hiểu lỗi sai, ôn từ SRS và học theo lịch cá nhân cùng EverLang.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider><Shell>{children}</Shell></AuthProvider>
      </body>
    </html>
  );
}
