import Link from "next/link";

export default function AdminOverview() {
  return <main className="page narrow">
    <p className="eyebrow">EVERLANG · QUẢN TRỊ</p>
    <h1>Không gian quản trị</h1>
    <p className="muted">Biên soạn, kiểm duyệt và xuất bản học liệu. Chỉ xuất bản nội dung đã được duyệt nguồn và quyền sử dụng.</p>
    <div className="form-stack">
      <section className="panel"><h2>Bài luyện</h2><p>Quản lý câu luyện dịch, bản nháp và quy trình xuất bản.</p><Link className="primary-button" href="/admin">Quản lý bài luyện →</Link></section>
      <section className="panel"><h2>Kiến thức</h2><p>Duyệt ngữ pháp, ví dụ, bài tập và phiên bản tài liệu.</p><Link className="primary-button" href="/admin/knowledge">Quản lý kiến thức →</Link></section>
      <section className="panel"><h2>Bộ từ</h2><p>Quản lý nghĩa cụ thể, ví dụ và các bộ từ theo chủ đề.</p><Link className="primary-button" href="/admin/word-sets">Quản lý bộ từ →</Link></section>
    </div>
  </main>;
}
