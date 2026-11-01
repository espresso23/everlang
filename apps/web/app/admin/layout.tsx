"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data, isPending, error, refetch } = useAuth();
  if (isPending) return <main className="page narrow" role="status">Đang kiểm tra quyền quản trị…</main>;
  if (error) return <main className="page narrow"><p role="alert">Chưa kết nối được tài khoản.</p><button onClick={() => void refetch()}>Thử lại kết nối</button></main>;
  if (!data?.user.admin) return <main className="page narrow"><section className="panel"><h1>Không có quyền quản trị</h1><p>Tài khoản này có thể sử dụng không gian học tập.</p><Link className="primary-button" href="/">Về học tập</Link></section></main>;
  return children;
}
