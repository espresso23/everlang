# Bằng chứng baseline — 2026-10-30

Baseline code đã commit: `1d0fbad`. Backfill tài liệu ghi hiện trạng trước phần profile.

| Nguồn | Quan sát | Phạm vi kết luận |
|---|---|---|
| Nhật ký handoff trước baseline | 10 unit test, 2 E2E, lint/typecheck/build đã qua; chấm OpenRouter thật 98/100 | Bằng chứng lần kiểm trước; không tự áp dụng cho code sửa sau |
| Log người dùng gửi lúc 06:33 UTC | Chuỗi anonymous 401 rồi test version/ownership 409/404/403 | Khớp luồng test; riêng log này không chứng minh Google login hỏng |
| Runtime app 09:48 UTC | Better Auth token exchange trả `invalid_client`, secret không hợp lệ | Callback Google đã tới app nhưng chưa có session thành công |
| Kiểm tra DB lúc điều tra | Một credential user, không Google account, không active session | Giải thích tại thời điểm đó vẫn hiện đăng nhập; không công bố danh tính/token |
| Sau người dùng cập nhật secret | Dummy refresh-token probe đổi từ invalid_client sang invalid_grant | Client configuration qua bước kiểm secret; dummy token cố ý sai, chưa phải login thành công |
| Source Shell baseline | Header chỉ icon UserRound, pending render sign-in | Avatar chưa được implement dù Google có image |

Không lưu secret hoặc URL chứa token vào evidence. [Audit nhóm](../audits/baseline-integration.md) phân biệt đã kiểm/chưa kiểm và các giới hạn dịch vụ ngoài.
