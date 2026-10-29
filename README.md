# Luyện Dịch Việt – Hàn

Ứng dụng luyện dịch Việt–Hàn TOPIK 4–6 dùng Next.js, OpenRouter và MongoDB. Docker Compose khởi chạy MongoDB 8 cùng ứng dụng; dữ liệu database được giữ trong volume `mongo_data`. 100 bài tập từ HTML tham khảo được đóng gói trong `data/seed-sentences.json` và tự nhập idempotently khi danh sách bài tập được tải lần đầu.

## Chạy tại máy

1. Cài Node.js 20.9 trở lên.
2. Sao chép `.env.example` thành `.env`; điền `OPENROUTER_API_KEY` và chọn `OPENROUTER_MODEL` (mặc định `qwen/qwen3.8-flash`). MongoDB URI mặc định trỏ tới dịch vụ Docker nội bộ.
3. Chạy `npm ci`, sau đó `npm run dev` và mở `http://localhost:3000`.

Chỉ cần MongoDB để xem ngân hàng bài tập; OpenRouter key được yêu cầu khi sinh câu hoặc chấm bài. URI mặc định `mongodb://mongo:27017/korean_practice` dành cho ứng dụng chạy trong Docker Compose. Nếu chạy Next.js trực tiếp bằng `npm run dev`, hãy dùng MongoDB URI có thể truy cập từ máy chủ đó. Không commit `.env`.

## Docker

Tạo `.env` như trên rồi chạy `docker compose up --build`. Ứng dụng lắng nghe cổng 3000; MongoDB chỉ được truy cập trong mạng Docker và lưu dữ liệu vào volume `mongo_data`.

### Log production

Log API là JSON theo từng dòng, có `timestamp`, `level`, `event`, `requestId`, route, HTTP status và thời gian xử lý. Mỗi API response trả header `x-request-id`; dùng ID này để tìm các lỗi liên quan. Request body, bản dịch và API key không được ghi log. Mức log mặc định là `info`; đặt `LOG_LEVEL=debug|info|warn|error` trong `.env` để thay đổi.

Xem log trực tiếp bằng `docker compose logs -f --tail=100 app`, hoặc Docker Desktop → Containers → `langz-app-1` → Logs. Docker giữ tối đa 5 tệp log, mỗi tệp 10 MB để giới hạn dung lượng.

## API

- `GET /api/sentences?topic=ALL&level=ALL&page=1&limit=20`
- `POST /api/sentences/generate` với `{ "topic": "Kinh tế", "level": "TOPIK 5", "count": 5 }`
- `POST /api/submissions/grade` với `{ "sentenceId": "...", "userTranslation": "..." }` và header `x-user-id`
- `GET /api/user/stats` với header `x-user-id`

Định danh người học là UUID được tạo và lưu trong trình duyệt. Không có tài khoản hoặc đồng bộ giữa các thiết bị trong phiên bản này.

## Tra từ KRdict

Tính năng tra nghĩa trực tiếp cần `KRDICT_API_KEY` (khóa 32 ký tự hex) từ Open API của [한국어기초사전 (KRdict)](https://krdict.korean.go.kr/kor/openApi/openApiInfo). Điền khóa trong `.env` rồi khởi động lại Docker Compose. Khi chưa có khóa, vẫn có thể mở trang KRdict và nghe phát âm bằng Web Speech API.

## Dữ liệu nguồn

`data/seed-sentences.json` chứa 100 câu đã trích xuất từ HTML đầu vào. Để tái tạo JSON từ bản HTML gốc, chạy `npm run seed:extract -- "đường-dẫn-tới-html" "data/seed-sentences.json"` (cần Python 3).
