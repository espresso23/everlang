# System design — vocabulary-srs

[Đặc tả](README.md) · [Functions](functions.md) · [UI](ui.md)

## Luồng thực tế

Kho từ/review UI → API → SQL row lock/version → FSRS review → card/review_logs commit → refresh UI/dashboard

```mermaid
flowchart LR
  UI["UI / caller"] --> API["Session / API / service"]
  API --> Data["Data / provider"]
  Data --> Result["Result / error"]
  Result --> UI
```

Sơ đồ khái quát ranh giới; chuỗi phía trên nêu rõ worker/provider/storage có áp dụng cho feature này.

## Dữ liệu và ownership

vocabulary, review_logs; due là timestamp, version tăng khi sửa/ôn. JSON card phục hồi dueAt/lastReviewAt thành Date.

API cá nhân luôn lấy user từ session ở [api](../../../lib/api.ts), không nhận user_id tùy ý từ request. Mutation dùng JSON/Origin; lỗi auth 401/403 không phải dữ liệu trống hợp lệ.

## Hợp đồng tích hợp

- GET /api/vocabulary?due=true — {items,dueCount}, tối đa 500.
- POST/PUT /api/vocabulary — term,meaning,context,note,kind,sourceId; PUT thêm id/version/suspended.
- POST /api/reviews — {id,rating:1..4,version,requestId}; 404 ownership, 409 stale/due.

## Failure modes và vận hành

Chưa có optimizer cá nhân hóa từ lịch sử dài hạn; dùng preset FSRS-7.

Phụ thuộc chung: [session/authorization](../../shared/auth-and-api.md), [storage/migrations](../../shared/data-model.md), [vận hành](../../shared/operations.md). Chỉ tên biến môi trường được ghi ở docs; không đưa token, cookie hay credential vào ví dụ/log.
