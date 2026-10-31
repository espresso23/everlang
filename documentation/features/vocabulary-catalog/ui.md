# UI — implemented, technical flows audited; release gates open

Giữ wireframe /vocabulary và /admin hiện có, chỉ thêm Link. Trang /word-sets dùng paper/ink/Cobalt, header + filters + bộ từ/card + panel bài học. Nội dung Hàn/Việt sentence case/line-height1.8, heading uppercase CSS, không black fill/gradient/shadow. Metadata domain/level/count thực, pagination; empty/error/loading rõ, bộ chưa xuất bản không xuất hiện. Tìm bằng Hàn/Việt, taxonomy chọn có cả nhóm chưa có content (0, không giả coverage).

Detail bộ hiển thị mô tả/nguồn/quyền, danh sách pinned senses; chọn từ để học, ẩn/hiện nghĩa chủ động. Meaning context/sense/register/POS rõ để phân biệt đồng tự. Audio word/example TTS thiết bị có nút riêng và lỗi khi không voice; chưa có curated audio hiện nhãn rõ. Link thu từ/câu qua /speech; unavailable provider vẫn không làm mất nội dung đọc.

Chọn số từ mới/ngày0–30; display lượt đã dùng/ngày/profileTZ, quota không che quyền đọc. Save→SRS explicit, duplicate giữ scheduling; known/skipped là tự đánh giá, không mastery và không tự pause card. Lỗi CAS giữ lựa chọn local, tải latest rồi retry có chủ ý; retry không tạo trùng. Source/version trace trên card. Loading/submit locks/stale fetch fences, không để response cũ chọn nhầm sense.

Admin có tabs senses/sets, form có label cho nội dung, repeated example rows, source/rights, preview; set editor chọn published sense revision (không nhập path/SQL), review checkbox explicit rồi publish. Đổi selection khi dirty cần confirm; beforeunload guard; lỗi giữ input. Keyboard focus/labels, targets44px, mobile320/desktop; giới hạn screenreader/hardware audio ghi audit.

Hiện thực thêm ví dụ ngắn trong nút chọn sense để phân biệt các từ đồng tự trước khi mở nghĩa; source/version notice cho thẻ cũ khi bài có revision mới. Self-report known/skipped có nhãn riêng, không là mastery.0 kết quả hiển thị0–0. TTS dùng giọng hệ thống/trình duyệt có thể local hoặc network tùy cấu hình thiết bị; không hứa offline. Admin reviewer identity không được public API trả ra.

Visual audit correction implemented and verified: admin sidebar giới hạn chiều cao/cuộn độc lập; chọn bộ resolve reference labels term/meaning/status từ đúng revision qua admin GET key/revision (bao gồm draft cho người duyệt). Link rời editor hỏi khi dirty, nút tải lại danh sách giữ form. Không tuyên bố browser-back SPA guard toàn app đã hoàn tất.

## 2026-10-31 — Kho hệ thống và lưu cá nhân

Phần mô tả tại /knowledge và /word-sets ghi rõ học liệu tiếng Hàn hệ thống và sổ đọc/kho ôn tập cá nhân. Giữ bố cục/tokens và các nút xem/lưu hiện có; nội dung chưa published vẫn không xuất hiện ở learner. [Audit tích hợp](../../audits/system-library-worker-errors.md).
