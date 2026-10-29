<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Quy tắc bàn giao dự án

- Sau **mọi thay đổi tính năng, sửa lỗi, cấu hình vận hành hoặc thay đổi dữ liệu** được yêu cầu trong dự án, cập nhật `HANDOFF.md` ngay trong cùng lượt làm việc.
- Ghi ngày, nội dung đã thay đổi, file liên quan, cách kiểm tra/kết quả và việc còn phải làm (nếu có). Giữ phần lịch sử cũ; bổ sung mục mới ở đầu nhật ký.
- Nếu chưa thể xác minh (ví dụ dịch vụ ngoài không khả dụng), ghi rõ giới hạn thay vì tuyên bố đã kiểm tra thành công.
- Không bao giờ ghi API key, mật khẩu, URI có thông tin xác thực hoặc nội dung bí mật vào `HANDOFF.md`, README, log hay mã nguồn. Chỉ ghi tên biến môi trường.
