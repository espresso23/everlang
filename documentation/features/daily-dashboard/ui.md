# UI — daily-dashboard

[Đặc tả](README.md) · [Functions](functions.md)

## Màn hình và hành vi đã implement

/: hero, stats, task list, sổ lỗi, liên kết vào practice/SRS; guest thấy welcome thay dữ liệu học. Task done là xác nhận thủ công, không phải tự chứng minh đã học.

## Luồng UI ↔ dữ liệu

Dashboard → GET profile/stats/due/drafts → makePlan → daily_plans → PATCH task → study_days → streak/UI

## Trạng thái và giới hạn

Chưa có AI lập lịch, notification hoặc cron bắt buộc. Rule-based tạo khi mở dashboard.

Đối chiếu route/component/source và trạng thái trong [screen inventory](../../shared/screens.md). Với API/CLI không có màn hình độc lập, UI tiêu thụ contract nằm ở màn hình nêu trên; không coi N/A là bỏ qua tích hợp.

## Thiết kế dùng chung

[Design system](../design-system/README.md): logo e, cobalt/lemon/trắng, màu phẳng, viền mảnh, không bóng cứng. API errors hiển thị message; auth và ownership cuối cùng vẫn kiểm phía server. Các ảnh được ghi rõ viewport/ngày và dữ liệu QA trong [bằng chứng baseline](../../shared/baseline-evidence.md).

Ảnh QA 2026-10-30, viewport 1440×1000: [màn hình learner](assets/screen-learner-desktop.png). Đây là bằng chứng render màn hình, không thay audit mọi thao tác/provider.
