# Màn hình đã implement

Inventory theo tất cả `app/**/page.tsx` tại baseline. Mỗi hàng trỏ tới UI chuẩn và source; API có code không đồng nghĩa dịch vụ ngoài đã kiểm chứng.

| Route / source | UI chuẩn | Thành phần / trạng thái hiện có |
|---|---|---|
| [/](../../app/page.tsx) | [Dashboard](../features/daily-dashboard/ui.md) | Lịch hôm nay, ưu tiên, hoàn thành/bỏ nhiệm vụ, streak |
| [/sign-in](../../app/sign-in/page.tsx) | [Auth](../features/identity-auth/ui.md) | Đăng nhập, đăng ký, quên/reset mật khẩu, nút Google, thông báo |
| [/practice](../../app/practice/page.tsx) | [Luyện dịch](../features/translation-practice/ui.md) | Danh sách/thẻ, lọc, editor nháp, chấm/job, báo cáo, từ điển, lịch sử/yêu thích |
| [/vocabulary](../../app/vocabulary/page.tsx) | [SRS](../features/vocabulary-srs/ui.md) | Kho từ, thêm/sửa/tạm dừng, thẻ ôn Again/Hard/Good/Easy |
| [/library](../../app/library/page.tsx) | [Nghe đọc nói](../features/immersive-learning/ui.md), [Tutor](../features/ai-tutor/ui.md) | Đọc/tra từ, transcript/chép chính tả, thu âm/STT, hỏi Tutor |
| [/exams](../../app/exams/page.tsx) | [Luyện thi](../features/exam-practice/ui.md) | Chọn đề, mini exam, timer, autosave, kết quả; chưa có kho đề đầy đủ |
| [/profile](../../app/profile/page.tsx) | [Profile](../features/user-profile/ui.md) | Tên, mục tiêu, phút, trình độ, múi giờ; bảo mật/nhập nháp; avatar/provider, loading/error/retry |
| [/admin](../../app/admin/page.tsx) | [Học liệu](../features/content-authoring/ui.md) | Tạo/duyệt/xuất bản, AI nháp, index Tutor; API chặn learner 403 |

[Shell](../../components/shell.tsx) chung: logo e/ngôi sao, header, navigation, footer, guest welcome. Palette hiện hành: paper/white/ink/Cobalt, Inter Variable và editorial typography; không neo brutalism/gradient/glow. Xem [design system](../features/design-system/ui.md).

Các trạng thái tải/lỗi/rỗng và giới hạn từng route được ghi tại UI feature. Shell phân biệt pending/error/guest/signed-in; avatar/profile được bổ sung trên feature/user-profile. Chưa coi toàn bộ route đã audit trực quan đầy đủ chỉ từ inventory này.


## Ảnh màn hình QA hiện tại

2026-10-30, 1440px desktop, dữ liệu synthetic: [dashboard](../features/daily-dashboard/assets/screen-learner-desktop.png), [profile email thật](../features/user-profile/assets/screen-learner-desktop.png), [luyện dịch](../features/translation-practice/assets/screen-learner-desktop.png), [kho từ](../features/vocabulary-srs/assets/screen-learner-desktop.png), [thư viện đọc](../features/immersive-learning/assets/screen-learner-desktop.png), [mini exam](../features/exam-practice/assets/screen-learner-desktop.png). [Profile desktop/mobile](../features/user-profile/ui.md) gồm fallback Google mô phỏng. Các ảnh không chứng minh STT/Tutor/microphone hoặc đề đầy đủ hoạt động; sign-in/admin được inventory qua source và audit quyền riêng, chưa có ảnh mới trong lượt này.

Theme mới theo [design guide](../design/README.md), [8 màn hình trước/sau](../design/screens.md). Ảnh feature riêng trước lượt này giữ làm lịch sử.


/profile hiện có learning passport view, inline editor và disclosure bảo mật/dữ liệu. Xem [UI mới](../features/user-profile/ui.md). Đây là ngoại lệ layout theo yêu cầu sau skin editorial.
