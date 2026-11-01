# System design — implemented, audit pending

Next.js /speech → Bearer JWT Nest API /api/speech → PostgreSQL speech_attempts + private volume → Redis/BullMQ everlang-speech → Nest SpeechProcessor WorkerHost → ffprobe/ffmpeg → whisper.cpp CPU → SQL → poll UI. Worker là Nest ApplicationContext tách khỏi web và API; BullMQ speech queue giữ tên/payload/recovery. Grading là Nest GradingProcessor riêng.

ADR: beta single-node dùng private filesystem volume thay yêu cầu S3 ngoài cho bản ghi local; chỉ speech_attempts dùng backend này, recording legacy vẫn có nguồn S3 riêng. Volume được mount app và speech worker, owner1001, app không chạy root. Mongo vẫn giữ học liệu; PostgreSQL giữ private attempts/progress; Redis không là nguồn kết quả lâu dài. Backup metadata+volume nhất quán và restore trước final gate. Migration005 additive, app cũ bỏ qua bảng; không DROP file/table khi rollback.

HTTP planned: GET /api/speech (capabilities/history hoặc id status), POST {audio,mime,reference,requestId,consent:true}, DELETE {id}; GET /api/speech/audio?id=uuid stream audio của chủ tài khoản. API guard verified session, origin/content-type JSON với mutations. Reference ≤300 chars là câu người học chọn, không feed model. Request hash bao gồm audio/mime/reference để idempotency khác payload trả409. One unfinished job/user để tránh backlog CPU;202 trả sau durable insert. Redis enqueue lỗi để row queued, recovery worker chạy lại; không mất file do lỗi queue.

File key do server tạo từ SHA256(userId)+UUID, root cố định env; không nhận path client. MIME signature + size trước ghi, ffprobe xác minh duration thực ≤20s trước inference; ffmpeg chuẩn hóa16kHz/mono PCM. Tất cả child_process dùng execFile/args, không shell; timeout/output bound và cleanup temp. Private playback Bearer JWT/no-store/nosniff, chỉ file nhỏ tối đa3MB; stream200 toàn file, không hứa Range206. Delete đánh dấu SQL deleted trước, worker update có deleted_at IS NULL; unlink failed thì trả lỗi và retry cleanup sau, không tuyên bố file đã biến mất.

Runtime profile speech: model download explicit có SHA256/nguồn/version, readonly model volume; không download model theo request. Native source pinned commit, CPU2 threads/concurrency1, container CPU/RAM limits. Heartbeat Redis chỉ xác nhận worker/config hiện diện, không chứng minh quality/model inference. Timeout và model lỗi là failed, không score0; caller có thể nghe lại private recording. Queue retry tối đa2, stale active recovery sau restart; SQL idempotency ngăn duplicate rows/results.

Điều chỉnh theo measurement: portable SSE nhận đúng trường hợp TTS từ 학교 nhưng elapsed31.0s, maxRSS287016KB của process tree đo bằng busybox time. Để tránh ép mọi máy chạy bản chậm, runtime đóng gói hai binary cùng source/model: AVX2+FMA+F16C khi CPU báo đủ flags, portable fallback khi thiếu. Không compile -march=native, không bật GPU, giữ2 threads. Backend selection và hai nhánh phải unit-test; latency/quality thực còn cần benchmark. Đây không là giảm yêu cầu hoặc đổi model âm thầm.

## ADR API free tier — trước code

Cùng queue/private storage, worker dispatch theo snapshot provider đã consent; config provider phải khớp row. Gemini worker dùng image chỉ Node+ffmpeg, không cần native/model download; local profile riêng giữ nguyên. API heartbeat gồm provider, worker/config phải khớp mới nhận job. Migration006 provider mặc định whispercpp cho row005, consent_version v1; không sửa migration005 đã chạy.

Sau normalize, Gemini nhận inline WAV qua HTTPS endpoint cố định generativelanguage.googleapis.com, API key trong header, không URL/log; chỉ instruction transcribe tiếng Hàn không reference/người dùng/profile. JSON transcript duy nhất, output cap1024 tokens, timeout45s, max2 attempts queue cho lỗi transient; quota/config/response invalid không retry. Redis atomic daily budget20 mỗi UTCday (fail closed khi Redis lỗi), retry external cũng tiêu budget. Google billing phải Free tier ngoài app; budget nội bộ không chứng minh zero-cost nếu operator bật billing. Không fallback khi quota hết. Xóa local record không hứa xóa dữ liệu đã được Google xử lý.

### Free API probe — giới hạn hiện tại

3.8Flash được chọn explicit sau2.5Flash404 cho new user. Probe với key đầu trả402 prepaid; owner thay key rồi request audio45s và text20s timeout. Đây là evidence availability không thành công, không chứng minh Free tier đã hoạt động hoặc chất lượng tiếng Hàn. Không thêm fallback trả phí. Low thinking theo docs3.8 là candidate điều chỉnh latency, cần đo lại trước áp dụng.

## 2026-10-31 — Worker boundary dùng chung

`apps/worker/src/speech.processor.ts` dùng `installProcessErrorHandlers`, guarded startup/timer recovery, structured worker error và shutdown có catch/deadline15s. Không đổi UI/consent/provider/ASR semantics. [Contract](../../shared/error-handling.md), [audit](../../audits/system-library-worker-errors.md).
