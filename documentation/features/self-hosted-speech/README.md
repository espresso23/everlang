# Thu âm và nhận dạng lời nói — đặc tả

Feature ID `self-hosted-speech`, implemented, audit một phần; cloud inference/human quality gates mở, 2026-10-31, branch feature/self-hosted-audio. Enabler PB-038 cho PB-020; không thay PB-026 pronunciation assessment hoặc audio mẫu PB-036. [Lựa chọn cấu hình thấp](../../research/low-resource-asr.md).

- SHS-01: thu hoặc nhập audio từ/câu tiếng Hàn ≤20s, nghe local trước khi gửi, đồng ý xử lý/lưu riêng tư; không mất blob nếu gửi lỗi. Browser chọn WebM hoặc MP4, cho import WAV.
- SHS-02: API authenticated trả202/jobId, requestId + content hash chống gửi trùng; queue background có timeout, retry giới hạn, recovery và trạng thái lỗi. Không trả transcript/điểm giả khi worker lỗi.
- SHS-03: CPU-only whisper.cpp multilingual base;1 job đồng thời/worker,1–2 threads;20s/file, kích thước3MB, kiểm format/duration/quiet trước model. Không cloud account/API fee để chạy local; hosting/tài nguyên máy vẫn có chi phí.
- SHS-04: audio trong local private volume; SQL ownership trước playback/delete/history. Không public đường dẫn disk; xóa record chặn playback ngay, cleanup file có retry rõ; worker không hồi sinh record đã xóa.
- SHS-05: version engine/model/language/elapsed được lưu cùng transcript. Không dùng reference text để gợi ý ASR; transcript chỉ là dữ liệu, không là score phát âm. Im lặng/không nhận dạng/lỗi model không lưu kết quả giả.
- SHS-06: provider disabled/worker offline/model unavailable có thông báo rõ. Chính sách default không chạy Gemma lớn; Gemma audio là candidate benchmark, chưa tích hợp. Không thay đổi Google/S3 recordings cũ.

Spec trước code; [system design](system-design.md), [functions](functions.md), [UI](ui.md), [audit](audit.md) sẽ ánh xạ hiện thực và evidence sau triển khai.

## Điều chỉnh đã duyệt — API miễn phí (2026-10-31, trước code)

Owner chọn API hoặc audio embedding miễn phí, giảm tải máy. SHS-07: thêm provider `gemini` dùng Gemini 3.8 Flash Standard free tier (thay ứng viên2.5 sau probe404 bên dưới); Whisper CPU giữ tùy chọn explicit. Không tự chuyển cloud/local, không fallback model có phí. Key server-only `GEMINI_API_KEY`; operator phải dùng project Free tier chưa bật billing. App không xác minh được billing Google qua key. Giới hạn nội bộ20 request/ngày UTC toàn hệ thống và3 lần gửi/phút/user, hết quota thì lỗi rõ.

SHS-08: ghi snapshot provider + consentVersion vào attempt trước enqueue (migration006 additive), request phải chỉ rõ provider đã đồng ý. UI hiển thị Google nhận audio và free tier có thể dùng dữ liệu cải thiện sản phẩm; local không gửi Google. Provider thay đổi phải chọn đồng ý lại; worker không gửi pending local lên cloud khi đổi config. Reference không gửi nhà cung cấp.

SHS-09: cùng giới hạn20s/3MB, normalize/quiet/duration trước external request. API45s, response schema + finishReason, không lưu response sai/safety/timeout thành transcript. Model/version được lưu; không gọi embedding để tạo điểm phát âm chưa hiệu chuẩn. Gemini Embedding2 free audio là candidate nghiên cứu, chưa tích hợp. External inference/quality NOT VERIFIED tới khi có key và test thật.

### Quyết định sau probe API thật

2026-10-31: metadata/list có2.5Flash nhưng generateContent trả404 “no longer available to new users”, đề nghị3.8Flash. Bảng giá hiện hành có Free tier3.8Flash; đổi model explicit sang `gemini-3.8-flash`, không runtime fallback. Probe3.8 trả402 RESOURCE_EXHAUSTED/prepaid credits depleted. Key không chứng minh project Free tier; cloud inference chưa xác minh, không bật billing/nạp tiền. Giữ local làm lựa chọn kiểm thử độc lập.

## 2026-10-31 — Worker boundary dùng chung

`apps/worker/src/speech.processor.ts` dùng `installProcessErrorHandlers`, guarded startup/timer recovery, structured worker error và shutdown có catch/deadline15s. Không đổi UI/consent/provider/ASR semantics. [Contract](../../shared/error-handling.md), [audit](../../audits/system-library-worker-errors.md).
