# Tài liệu EverLang

Thư mục này chứa đặc tả, system design, function description, UI và audit chuẩn cho từng feature. Quy tắc bắt buộc nằm trong [AGENTS.md](../AGENTS.md).

## Cấu trúc

```text
documentation/
  README.md                         # Mục lục và trạng thái feature
  features/<feature-id>/
    README.md                       # Phạm vi, yêu cầu, tiêu chí, traceability
    system-design.md                # Kiến trúc, dữ liệu, hợp đồng, luồng tích hợp
    functions.md                    # Hàm/điểm vào, I/O, side effect, lỗi
    ui.md                           # Màn hình, trạng thái và tương tác
    audit.md                        # Kết quả review và xác minh
    assets/                         # Ảnh/sơ đồ/bằng chứng không chứa bí mật
  shared/<component-id>.md          # Hợp đồng chuẩn của thành phần dùng chung
  audits/<group-id>.md              # Audit tích hợp một nhóm feature
  templates/feature/               # Bộ mẫu; không phải feature đã triển khai
```

Chỉ tạo thư mục `shared/`, `audits/`, `assets/` khi có tài liệu hoặc bằng chứng tương ứng. Mỗi feature có một thư mục chuẩn; nhiều file code có thể cùng hiện thực feature đó.

## Mục lục feature

| Feature ID | Tên | Tài liệu chuẩn | Code/điểm vào | Trạng thái | Audit |
|---|---|---|---|---|---|

Mục lục theo chuẩn mới chưa được lập cho các feature legacy. Khi triển khai hoặc sửa một feature, đăng ký một hàng với liên kết thực tế, bổ sung bộ tài liệu và audit trong cùng thay đổi. Không tạo liên kết tới tài liệu chưa tồn tại hoặc suy diễn rằng feature đã verified.

Trạng thái: `planned` → `implemented` → `verified`; dùng `blocked` khi thiếu điều kiện bắt buộc và ghi rõ giới hạn. Không ghi `verified` khi còn yêu cầu bắt buộc `FAIL` hoặc `NOT VERIFIED`.

## Quy trình

1. Chọn/tái sử dụng branch đúng phạm vi, ví dụ `feature/JIRA-456-add-login-page`.
2. Sao chép [bộ mẫu feature](templates/feature/README.md) sang `features/<feature-id>/`; thay toàn bộ placeholder, xác định yêu cầu và các kết nối cần kiểm.
3. Triển khai theo đặc tả; cập nhật tài liệu nếu có quyết định thiết kế mới. Mỗi yêu cầu/hành vi liên kết tới route, file + symbol và cách kiểm tra thực tế.
4. Audit feature và các kết nối bị ảnh hưởng. Nếu có nhóm feature liên quan, thêm audit nhóm theo cấu trúc [mẫu audit](templates/feature/audit.md).
5. Kiểm tra tham chiếu hai chiều, cập nhật mục lục và [HANDOFF.md](../HANDOFF.md). Không ghi credential, token, dữ liệu người dùng thật hoặc URL chứa thông tin xác thực vào bằng chứng.

Các thay đổi chỉ bổ sung quy tắc/tài liệu không yêu cầu backfill toàn bộ ứng dụng trong cùng lượt. Những feature legacy được chạm tới từ sau quy tắc này phải được chuẩn hóa trước khi bàn giao thay đổi của feature đó.
