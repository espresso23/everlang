# ASR cấu hình thấp — quyết định nghiên cứu

Ngày 2026-10-31; cập nhật theo yêu cầu owner ưu tiên cấu hình thấp, có thể dùng model ASR/audio của Google Gemma. Trạng thái: **hướng kỹ thuật đã chọn để thử nghiệm, chưa tích hợp/benchmark**. Không thay yêu cầu chấm phát âm bằng nhận dạng transcript; goal tự học còn active.

## Hai phương án

| Phương án | Căn cứ đã kiểm | Quyết định |
|---|---|---|
| A. whisper.cpp, base multilingual; tiny làm chế độ tiết kiệm nếu kết quả chấp nhận | [Repo chính thức](https://github.com/ggml-org/whisper.cpp) hỗ trợ CPU; bảng model memory base~388MB, tiny~273MB là số liệu tác giả, không là RAM toàn EverLang hoặc kết quả máy đích | Ưu tiên spike vì tác vụ ASR chuyên biệt và ngân sách tài nguyên thấp; không dùng .en. |
| B. Google Gemma4 E2B có audio | [Model card chính thức](https://ai.google.dev/gemma/docs/core/model_card_4) ghi audio/ASR trên E2B/E4B/12B. E2B có2.3B effective/5.1B với embeddings và audio encoder~300M; E không có nghĩa model chỉ cần2GB | Ứng viên đối chiếu, chưa mặc định chạy thường trực trên máy nhỏ. Cần runtime hỗ trợ audio thực và benchmark tiếng Hàn. |

[Gemma3n overview](https://ai.google.dev/gemma/docs/gemma-3n) cũng công bố audio input và tối ưu effective parameters/PLE; không suy RAM audio từ số effective parameters hoặc từ cấu hình text-only. [Audio guide của Google](https://ai.google.dev/gemma/docs/capabilities/audio) hiện hướng dẫn Gemma4, mono16kHz và tối đa30 giây mỗi audio input. Không giả định mọi bản Gemma hoặc mọi runtime GGUF đều nhận audio.

Nguồn đọc ngày2026-10-31: repo/model card/audio guide là primary sources. Chỉ kiểm tài liệu công khai; chưa download/run Gemma hoặc đo CER tiếng Hàn. ASR đa ngôn ngữ và benchmark tổng hợp không đủ chứng minh hiệu quả trên giọng người Việt học tiếng Hàn. Đây là inference để chọn spike, không kết luận so sánh chất lượng/latency thực nghiệm.

## Hợp đồng tài nguyên và tích hợp dự kiến

- Dùng monolith Next.js + worker hiện có; ASR xử lý nền, có trạng thái/retry/idempotency và quyền sở hữu. Không đưa model inference vào browser request dài hoặc bắt tải model vào browser.
- Mục tiêu thử: CPU-only,1–2 threads,1 tác vụ ASR đồng thời; base trước. Đây là cấu hình dự kiến, không phải cam kết chạy đủ app+Mongo+PostgreSQL+Redis trên một VPS RAM thấp chưa biết cấu hình.
- Cắt giảm context không cần thiết, nhận dạng tiếng Hàn cố định và task transcribe; không mặc định dịch sang tiếng Anh. Nếu backend có giới hạn input, hiển thị rõ/segment hợp lệ, không cắt âm thanh âm thầm.
- Model nạp theo nhu cầu hoặc worker chuyên trách có resource limit; một người dùng beta trước. Chọn tiny chỉ khi đo được tradeoff chấp nhận được, không hạ chất lượng âm thầm để đạt số RAM.
- Media có thể dùng private local volume cho beta single-node để tránh yêu cầu S3 bên ngoài. Trước code phải có ADR/schema/auth/backup/rollback và migration; audio mẫu được duyệt tách khỏi recording riêng tư. Đây là phương án thiết kế, chưa đổi backend media hiện tại.
- Provider ASR trả transcript/timestamps/capability/version/diagnostics cần thiết; không đặt tên transcript similarity là pronunciation score. Một LLM giải thích transcript không kiểm chứng được khẩu hình/âm vị người nói đã phát ra.

## Benchmark bắt buộc trước khi bật mặc định

1. Chốt CPU/RAM máy đích; đo peak RSS của process/container, cold/warm latency, queue wait và CPU trong khi app+DB hoạt động. Không dùng kích thước file model hoặc memory bảng repo làm peak toàn stack.
2. Bộ từ riêng/câu ngắn/dài, giọng nhiều người, tiếng nền, im lặng và câu sai âm có reference được người duyệt; chép đúng transcript thực tế, không đưa đáp án mẫu vào prompt để làm đẹp kết quả.
3. Đo CER/WER với quy tắc chuẩn hóa đã lưu, hallucination/no-speech và false rejection. Báo riêng kết quả từ đơn và câu; không lấy CER làm điểm phát âm.
4. Đối chiếu hai phương án trong cùng điều kiện nếu Gemma runtime/model sẵn dùng. Nếu thiếu thì ghi NOT VERIFIED, không giả chạy. Dừng thử model khi vượt resource budget đã chốt, không tự tăng gói/mua GPU.
5. Chỉ kết luận phương án mặc định sau dữ liệu thử. Chấm phát âm cần assessment riêng/benchmark người chấm; PB-026 chưa Done khi ASR đạt.

## Traceability và việc tiếp theo

PB-020: thu âm/private playback/ASR; PB-026: pronunciation assessment; PB-036: audio từ/câu. [Completion matrix](../planning/SELF_STUDY_DELIVERY.md) giữ nguyên phạm vi, [research tự học](self-study-vocabulary-pronunciation.md) là đầu vào sản phẩm. Không tự đổi scope sprint, estimate hoặc trạng thái task chỉ từ việc chọn ứng viên.

Bước thực thi kế tiếp: đặc tả5 docs cho runtime audio/local media và refine task trước code; spike whisper.cpp base trên audio tiếng Hàn có nguồn/quyền, sau đó quyết định provider. Không cần owner tạo tài khoản cloud trả phí để bắt đầu các phần này.
