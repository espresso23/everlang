# Audit — <feature-id hoặc group-id>

- Ngày: <YYYY-MM-DD>
- Branch/commit/phạm vi diff: <giá trị thật; không cần tự commit để lấy revision>
- Người/agent review: <reviewer; ghi rõ lượt audit tách khỏi implementation>
- Feature liên quan: <liên kết các đặc tả và audit thành phần nếu là audit nhóm>
- Môi trường: <local/test/staging, cấu hình có liên quan; không ghi secret>
- Kết luận: `PASS | FAIL | NOT VERIFIED`

## Đối chiếu yêu cầu → code → bằng chứng

| Yêu cầu/contract/UI ID | Code tham chiếu | Cách kiểm/lệnh | Kết quả | Bằng chứng/phát hiện |
|---|---|---|---|---|
| <REQ-01/API-01/UI-01> | <file + symbol thật> | <bước tái hiện> | <PASS/FAIL/NOT VERIFIED/N/A> | <liên kết test/log đã lọc/ảnh> |

`PASS` cần bằng chứng; `N/A` cần lý do. `NOT VERIFIED` không tương đương `PASS`. Test tự động không bắt buộc cho chỉnh sửa nhỏ nếu kiểm tra trực quan/smoke đã đủ, nhưng phải ghi bằng chứng phù hợp.

## Audit tích hợp

| Kết nối/luồng | Contract hai đầu | Luồng thành công và lỗi đã kiểm | Kết quả | Giới hạn |
|---|---|---|---|---|
| <UI → auth → API → worker → DB → UI; bỏ bước không áp dụng> | <liên kết code và docs> | <input/output, ownership, retry, trạng thái> | <kết quả> | <phụ thuộc/chưa kiểm> |

<Audit nhóm phải có ma trận này và tham chiếu từng feature; không chỉ tổng hợp các unit test riêng lẻ.>

## Phát hiện và xử lý

| Mức độ | Phát hiện | Yêu cầu bị ảnh hưởng | Cách sửa/bằng chứng sửa | Trạng thái |
|---|---|---|---|---|
| <mức độ> | <lỗi cụ thể> | <ID> | <tham chiếu thật> | <open/resolved/blocked> |

## Điều kiện bàn giao

- <Yêu cầu bắt buộc đã đạt; không đánh dấu hoàn tất nếu còn FAIL/NOT VERIFIED bắt buộc>.
- <Đối chiếu docs–code hai chiều; file/symbol/link/UI/contract tồn tại và nhất quán>.
- <Migration/khôi phục/rollout khi áp dụng; giới hạn môi trường và kiểm định chất lượng>.
- <Việc còn lại, điều kiện xác minh tiếp và liên kết HANDOFF.md>.
