# Bộ từ theo chủ đề và nghĩa cụ thể

Feature ID vocabulary-catalog · implemented, technical audit có bằng chứng; content/audio release gates còn mở (đặc tả được viết trước code) · 2026-10-31 · PB-035, hỗ trợ PB-018/036/020. [Research](../../research/self-study-vocabulary-pronunciation.md). Full self-study vẫn active; bộ nháp mẫu không thay thế coverage tất cả chủ đề/ngành.

| ID | Hành vi bắt buộc |
|---|---|
| VC-01 | Taxonomy đời sống/học tập/công việc/chuyên ngành, level tự học; bộ từ tìm/lọc/phân trang, số từ thực và coverage. Không gọi mọi từ là thường dùng nhất nếu chưa corpus frequency. |
| VC-02 | Sense stable key, headword/POS/phát âm/hanja/register/nghĩa Việt/collocation/ví dụ Hàn–Việt/nguồn/quyền. Một sense được nhiều bộ tham chiếu, các nghĩa cùng chữ không gộp. |
| VC-03 | Mongo versioned sense/set: draft→reviewed→published, review explicit bởi admin, optimistic CAS; published immutable/fork. Bộ pin revision của senses đã published; bản sửa không âm thầm thay nội dung lịch sử. |
| VC-04 | Người học xem/ẩn nghĩa, nghe TTS thiết bị cho từ/câu (nhãn rõ, lỗi có fallback), dẫn sang luyện thu từ/câu. Audio curated phải PB-036 hoàn thiện; không hứa TTS thiết bị là giọng đã duyệt. |
| VC-05 | Lưu sense từ bộ vào FSRS hiện có, snapshot server, chống trùng theo user/sense; giữ card/due/log/version khi lưu lại/cross-set. Từ cùng chữ khác sense có thẻ độc lập. Không dùng điểm phát âm tự chọn mức FSRS. |
| VC-06 | Đánh dấu đã biết/bỏ qua/đang học có CAS, riêng mỗi user và nghĩa, không là mastery. Chọn số từ mới/ngày0–30; giới hạn toàn bộ bộ từ theo ngày/múi giờ profile, cạnh tranh nhiều tab không vượt. Lưu từ đã có không tiêu thêm lượt. |
| VC-07 | Admin form cho sense/set, tìm chọn reference published, draft không lộ tới learner, nội dung nháp AI không tự xuất bản. Search dùng latest published trước filter, không làm revision cũ xuất hiện lại. |
| VC-08 | Migration giữ card/review logs lịch cũ; bridge rollback POST targetless conflict được build/deploy trước007. Backup+restore metadata/Mongo, regression manual cards/reviews và2-account isolation. |

Spec trước code; canonical [system design](system-design.md), [functions](functions.md), [UI](ui.md), [audit](audit.md). Audio curated/quality và toàn bộ corpus có reviewer là release gates, không coi full feature Done từ technical sample.

## 2026-10-31 — Kho hệ thống và lưu cá nhân

Kho từ và tài liệu ngữ pháp thuộc hệ thống, dùng chung theo ngôn ngữ; bản đã published cho mọi tài khoản verified xem/lưu. Beta chỉ có tiếng Hàn (ko); không tự xuất bản draft. [Audit tích hợp](../../audits/system-library-worker-errors.md).


## Editorial workbench — implemented2026-11-01

Canonical requirements EW-01–05: documentation/features/content-authoring/README.md. Admin GET query params validated, TypeORM list filters/count/order; shared EditorialDesk calls existing mutations with explicit saved version. StudentPreview read-only saved snapshot and exact references; confirm calls current publish transition, no preview writes. Shared UI: table/filter/pager, batch source/rights, JSON dryrun/import, focused existing editor. No schema migration; retain permission/CAS/published-only learner rules.
