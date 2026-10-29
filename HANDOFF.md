# HANDOFF — Luyện Dịch Việt–Hàn

Cập nhật gần nhất: 2026-10-29

## Trạng thái hiện tại

- Ứng dụng Next.js chạy bằng Docker Compose tại `http://localhost:3000`; lần kiểm tra trong phiên này trả HTTP 200.
- Hai container đang hoạt động: `langz-app-1` và `langz-mongo-1`; MongoDB healthcheck healthy, dữ liệu lưu trong volume `mongo_data`.
- Model OpenRouter đang cấu hình là `qwen/qwen3.8-flash`. Kiểm tra trực tiếp OpenRouter trong phiên trước trả JSON hợp lệ với `finish_reason: stop`; không thực hiện chấm một bài dịch đầy đủ với model mới.
- `data/seed-sentences.json` có đúng 100 bài. API danh sách tự nhập seed theo cách idempotent khi cần.
- Không có đăng nhập. Tiến độ, yêu thích và bài đã chấm gắn với UUID bền vững trong trình duyệt; không đồng bộ liên thiết bị.
- Chưa có tính năng/việc triển khai dở dang được biết đến. Các lưu ý và việc nên làm tiếp theo ở cuối tài liệu.

## Tính năng đã có

- Luyện dịch với chế độ danh sách/thẻ, lọc chủ đề và TOPIK, tìm kiếm, phân trang, tiến độ, gợi ý từ vựng ngắn, nhập câu trả lời, xem đáp án/ngữ pháp và nghe câu mẫu bằng Web Speech API `ko-KR`.
- Tạo bài mới và chấm bản dịch bằng OpenRouter; schema đầu ra được kiểm tra bằng Zod, JSON lỗi được thử phục hồi bằng `jsonrepair`, lỗi API được ghi log JSON có `requestId`.
- Chấm lại cùng nội dung dùng báo cáo đã lưu; người học có thể chủ động yêu cầu chấm lại. Điểm thống kê đếm bài/câu riêng biệt theo `sentenceId`, không tăng theo số lần gọi chấm.
- Xem lịch sử bài đã chấm, câu yêu thích, điểm/nhận xét đã lưu. Dữ liệu submission và trạng thái yêu thích ở MongoDB theo `userId` của trình duyệt.
- Từ/cụm tiếng Hàn có thể chọn để tra; có popup từ điển, nghĩa/loại mục từ khi KRdict trả dữ liệu, liên kết mở KRdict và phát âm. Tra cứu qua API yêu cầu `KRDICT_API_KEY`; Web Speech vẫn dùng được khi thiếu khóa.
- Docker Compose khởi chạy ứng dụng và MongoDB 8; volume giữ dữ liệu MongoDB qua lần khởi động lại. Không đưa MongoDB vào Atlas trong cấu hình mặc định hiện tại.

## Lịch sử công việc của phiên

### 2026-10-29 — Bỏ qua dấu câu khi chấm bản dịch

- Yêu cầu: không quan trọng bài làm có dấu câu hay không.
- File: `lib/ai.ts` — bổ sung prompt bỏ qua việc có/thiếu/khác dấu câu khi tính điểm và nhận xét; không tạo lỗi ngữ pháp, gợi ý từ vựng hoặc giải thích chỉ để sửa dấu câu. Thêm ví dụ `해방시키는 것이다` tương đương `해방시키는 것이다.`; vẫn kiểm tra đuôi câu tiếng Hàn như ngữ pháp.
- Kiểm tra: ESLint cho `lib/ai.ts` và TypeScript `npx tsc --noEmit` thành công. Chưa gọi AI thật để xác minh phản hồi và chưa rebuild Docker trong lượt này.
- Áp dụng: kết quả đã lưu giữ nguyên; sau khi triển khai bản mới, bấm **Chấm lại bằng AI** để chấm bài cũ theo prompt mới.


### Nền tảng và dữ liệu

- Dựng ứng dụng Next.js App Router + TypeScript + Tailwind; chuyển 100 câu từ HTML tham khảo vào JSON seed; xây API danh sách/lọc/phân trang, sinh bài, chấm và thống kê.
- Tạo model Mongoose cho bài tập, bài chấm và trạng thái bài tập theo người dùng ẩn danh.
- Thêm Dockerfile, Compose, MongoDB 8, volume, healthcheck, cấu hình môi trường và hướng dẫn log production.

### Trải nghiệm học và từ điển

- Bổ sung xem đánh giá đã lưu để tránh gọi AI lại không cần thiết; chấm lại có chủ đích.
- Bổ sung lịch sử bài đã chấm và yêu thích; thống kê tính theo số bài riêng, không theo số lượt chấm.
- Bổ sung gợi ý từ vựng vừa phải theo câu nguồn.
- Bổ sung chọn từ/cụm từ, popup từ điển có thể cuộn/tương tác, đánh dấu từ, phát âm; hỗ trợ KRdict và mở từ điển ngoài khi không tìm thấy mục phù hợp.

### OpenRouter và độ ổn định chấm

- Loại Gemini khỏi luồng AI; nhà cung cấp hiện tại là OpenRouter.
- Đã xử lý các tình huống model free trả rỗng, JSON sai/cắt cụt, reasoning chiếm hết token, model slug không còn miễn phí và lỗi upstream; có log phục vụ chẩn đoán.
- Model đang đặt là `qwen/qwen3.8-flash` (model trả phí theo mức sử dụng). `lib/ai.ts` tắt reasoning cho model này, yêu cầu JSON mode và giới hạn cấu trúc bằng schema.
- Prompt chấm nhấn mạnh chỉ đánh giá bản tiếng Hàn người học nhập; lọc đầu ra để lỗi ngữ pháp/từ vựng phải trích nguyên văn tiếng Hàn từ bài làm, không được phê bình câu nguồn tiếng Việt. Xếp loại được tính nhất quán từ điểm số.
- Phiên trước đã chạy ESLint, kiểm tra TypeScript, thử một request OpenRouter tối thiểu và build/recreate Docker. Ở bước tổng kết hiện tại xác nhận container đang chạy và trang trả HTTP 200.

## File đã thay đổi hoặc tạo

### Ứng dụng và API

- `app/page.tsx` — giao diện luyện tập, trạng thái, lịch sử/yêu thích, popup tra cứu và kết quả chấm.
- `app/globals.css`, `app/layout.tsx` — giao diện responsive và metadata/layout.
- `app/api/sentences/route.ts` — danh sách/lọc/phân trang và nạp seed.
- `app/api/sentences/generate/route.ts` — sinh bài qua AI.
- `app/api/submissions/grade/route.ts` — xác thực đầu vào, dùng báo cáo đã lưu hoặc chấm/lưu mới.
- `app/api/submissions/route.ts` — lịch sử bài đã chấm.
- `app/api/user/stats/route.ts`, `app/api/user/favorites/route.ts` — thống kê và yêu thích.
- `app/api/dictionary/route.ts` — tra KRdict.

### Dữ liệu và thư viện

- `data/seed-sentences.json` — 100 bài nhập từ HTML tham khảo.
- `lib/ai.ts` — tích hợp OpenRouter, schema, prompt chấm/sinh bài, phục hồi JSON và ánh xạ lỗi.
- `lib/db.ts`, `lib/logger.ts`, `lib/user-id.ts`, `lib/types.ts` — kết nối MongoDB, log có cấu trúc, định danh người dùng và kiểu/chủ đề/cấp độ.
- `lib/models/Sentence.ts`, `lib/models/Submission.ts`, `lib/models/UserSentenceState.ts` — schema MongoDB.
- `scripts/extract-seed.py` — trích dữ liệu seed từ HTML.
- `scripts/start-standalone.mjs` — khởi chạy Next standalone trong container.

### Build, cấu hình, tài liệu

- `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `dockerRebuild.ps1` — Docker/build/rebuild.
- `.env.example` — tên biến và cấu hình mẫu; file `.env` thực tế không được ghi vào handoff.
- `package.json`, `package-lock.json`, `next.config.ts` — dependencies và cấu hình Next.
- `README.md` — hướng dẫn chạy, API, log, KRdict; đã đồng bộ model mặc định với Qwen trong lần cập nhật handoff.
- `AGENTS.md` — quy tắc Next.js hiện hữu và quy tắc cập nhật handoff sau mọi thay đổi.
- `Project_IDEA.md` — ý tưởng/định hướng dự án ban đầu.

## Cấu hình và lưu ý kỹ thuật

- Cần các biến: `MONGODB_URI`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `KRDICT_API_KEY`, `LOG_LEVEL`. Chỉ `OPENROUTER_API_KEY` bắt buộc cho sinh/chấm AI; MongoDB cần cho dữ liệu bài học và trạng thái.
- `.env` chứa thông tin nhạy cảm và không được commit/hiển thị. Một API key từng được dán vào cuộc trò chuyện; nên thu hồi/rotate các key đã chia sẻ công khai và chỉ dùng key mới trong `.env`. Tuyệt đối không đưa giá trị key vào handoff/log.
- Compose mặc định dùng `mongodb://mongo:27017/korean_practice`; URI `localhost` trong container sẽ không trỏ tới Mongo container.
- Khi thay đổi biến môi trường/Docker hoặc dependency, cần recreate/build lại container để cấu hình được áp dụng. Lệnh thông dụng: `docker compose up --build -d`.
- Log: `docker compose logs -f --tail=100 app`; mỗi response API có `x-request-id`. Không log request body/bản dịch/key.
- Nếu model đổi, kiểm tra slug, quyền truy cập, response format và reasoning behavior của model; không giả định model free có sẵn mãi. Cache đánh giá cũ không tự được thay bằng kết quả model mới; dùng nút chấm lại để tạo báo cáo mới.
- Quy tắc Next.js được generate trong block đánh dấu ở `AGENTS.md`; không sửa/xóa block này nếu không cần. Quy tắc handoff được thêm bên ngoài block.

## Bước tiếp theo

1. Nếu muốn xác nhận đầu cuối model mới, thử chấm một bài dịch thực tế và kiểm tra cả chất lượng, báo cáo lưu MongoDB, nút xem lại/chấm lại. Chưa xác minh end-to-end bài chấm Qwen mới trong phiên gần nhất.
2. Cập nhật/rotate các khóa đã từng chia sẻ, kiểm tra `.env` cục bộ (không in giá trị ra log/chat) và xác nhận OpenRouter còn quota/tài khoản hoạt động.
3. Khi phát triển feature hoặc sửa lỗi tiếp theo, cập nhật nhật ký ở đầu `HANDOFF.md` theo quy tắc trong `AGENTS.md`, bao gồm file, xác minh và việc còn lại.

## Nhật ký thay đổi

### 2026-10-29 — Qwen 3.8 Flash và handoff

- Chuyển mặc định OpenRouter sang `qwen/qwen3.8-flash`; tắt reasoning cho model này.
- Siết prompt và lọc phản hồi chấm để không coi câu tiếng Việt nguồn là bài làm/lỗi tiếng Hàn.
- Đồng bộ hướng dẫn model trong README; bổ sung quy tắc ghi handoff sau mỗi thay đổi.
- Xác minh trong lượt này: seed có 100 câu, Docker app/Mongo đang chạy, trang chủ trả HTTP 200. Build, lint/typecheck và request OpenRouter tối thiểu đã chạy ở phần trước của phiên.
- Việc còn lại: kiểm thử thủ công một bài dịch đầy đủ với model mới.
