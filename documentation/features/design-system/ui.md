# UI — EverLang Editorial

[Quy chuẩn bắt buộc](../../design/README.md) · [Source contracts](functions.md).

Áp dụng đủ 8 route: dashboard, sign-in, practice, vocabulary/SRS, library/Tutor, exams, profile và admin. Thứ tự nội dung, navigation và khung wireframe giữ nguyên; token/corner/typography thay theo style mới.

H1/H2 UI uppercase weight800–850, tracking chặt; nhãn phụ tracking rộng vừa. Tên user/profile, từ SRS, textarea/câu mẫu và Hangul không uppercase/giãn chữ. Hero và sign-in dùng ink/Cobalt trên paper; section label ink trên nền sáng. Số thống kê tabular/Cobalt. Notebook surface trắng với empty state paper, nội dung ink/muted và Cobalt. Quote, vertical note và layered Hangul nằm trong hero artwork aria-hidden cũ; không chặn nội dung/click.

Card nền trắng viền mảnh, góc8px; CTA Cobalt, secondary trắng/ink, focus Cobalt rõ. Inputs trắng, biên control đủ tương phản. Search input khôi phục inset pl-10 đã khai báo để tránh icon đè chữ. Lỗi/feedback semantic giữ nhãn và màu phù hợp, không thay logic.

Trạng thái loading/error/empty/success/disabled/session/avatar không đổi hành vi. Mobile giữ nav cuộn ngang, hero-art ẩn, dashboard2→1 cột theo breakpoint cũ. Typography có thể wrap tự nhiên; không clip text để giữ chiều cao ảnh.

## Bằng chứng trước/sau

Fixture giả lập chỉ để review UI, không là bằng chứng API/provider chạy thật. Mỗi route có ảnh1440 và390;320 kiểm overflow/structure không lưu ảnh để giảm trùng. Xem [gallery](../../design/screens.md), [audit](audit.md), wireframe [1440](assets/wireframe-1440.json), [390](assets/wireframe-390.json), [320](assets/wireframe-320.json).


Chỉ /profile được yêu cầu đổi layout sang [Learning Passport](../user-profile/ui.md). Bảy route khác giữ wireframe; baseline JSON không bị ghi đè, profile có kiểm thử state/overflow riêng.

Palette nhẹ: bỏ black fill ở title/date/Beta/completed-task/auth art note; lớp chữ và quote artwork nhẹ hơn. [Sổ tay trống desktop](assets/light-notebook-empty-desktop.png), [trống mobile](assets/light-notebook-empty-mobile.png), [có lỗi desktop](assets/light-notebook-filled-desktop.png), [có lỗi mobile](assets/light-notebook-filled-mobile.png). Ảnh synthetic QA, không phải dữ liệu học thật.

## Mobile text spacing — 2026-10-31
Wordmark dùng cỡ chữ responsive 20–22px trong breakpoint760px hiện có để header không tràn ở320px khi tăng letter/word spacing. Giữ logo e, Beta, nút tài khoản, thứ tự, padding/gap và khung bố cục. Không che overflow để giấu nội dung. Bằng chứng tại audit vocabulary-catalog.


## 2026-11-02 — DS-08 component xác nhận

Dialog surface/ink/Cobalt có message, Hủy và nút hành động cụ thể; focus đầu vào Hủy, Tab vòng kín, Escape hủy và trả focus. Responsive 1440/390/320; không thay wireframe trang. [320px](assets/confirmation-320.png), [390px](assets/confirmation-390.png), [1440px](assets/confirmation-1440.png).

[Hợp đồng dùng chung](../../shared/confirmation-ui.md) · [Audit tích hợp và giới hạn](../../audits/confirmation-ui-2026-11-02.md).

Final audit: `useConfirmation` gắn AbortController theo vòng đời caller; caller unmount (kể cả browser Back) hủy pending decision và đóng dialog. Test regression tại confirmation.spec.ts; không bảo vệ mọi navigation khi chưa có dialog mở.
