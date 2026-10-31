# Function contracts — implemented, audit pending

| File + symbol | Hành vi và side effects |
|---|---|
| [contract](../../../lib/speech/contract.ts): `speechBody`, `decodeSpeech`, `speechFingerprint`, `speechFileKey`, `validSpeechFileKey`, `speechView` | Limits20s/3MB, JSON identity strict, signature/base64 checks, hash bytes/mime/reference, server-generated user-hashed file key và safe response projection. |
| [storage](../../../lib/speech/storage.ts): `speechMediaPath`, `writeSpeechAudio`, `readSpeechAudio`, `hasSpeechAudio`, `removeSpeechAudio` | Root-contained paths, file mode600/user directory700, exclusive create, unlink idempotent; không lấy path client. |
| [runtime](../../../lib/speech/runtime.ts): `chooseSpeechBackend`, `speechRuntime` | Đủ avx2/fma/f16c mới dùng optimized binary; fallback portable, custom binary chỉ config operator. |
| [transcribe](../../../lib/speech/transcribe.ts): `inspectSpeechPcm`, `pcmIsQuiet`, `transcribeLocal`, `SpeechInputError` | Probe/normalize bounded; streaming WebM thiếu Duration dùng decoded PCM sample count; reject >20s/quiet, không silent truncate; subprocess shell-free + timeout + verified temp cleanup; reference không đi vào model. |
| [queue](../../../lib/speech/queue.ts): `getSpeechQueue`, `enqueueSpeech` | Durable SQL outbox được enqueue bằng id; BullMQ attempts2/backoff3s, jobId stable. |
| [worker](../../../scripts/speech-worker.ts): `verifyRuntime`, `recoverSpeech`, `worker` | Model SHA verified; process queue concurrency1, CAS không overwrite completed/deleted; heartbeat30s/recovery10s; staging>2min có/không file; retry cleanup và tombstone prune7d. |
| [model setup](../../../scripts/download-speech-model.mjs): `checksum` | Stream file download với size+SHA pinned, atomic rename, no download nếu checksum đúng; timeout600s, failure không dùng model chưa xác minh. |
| [speech API](../../../app/api/speech/route.ts): `GET/POST/DELETE` | Session ownership, idempotent input hash/one pending user; PG staging + row lock trong FS write chống delete race;202 sau durable queue state; failed Redis enqueue recovery; DELETE chặn truy cập và xóa file, lỗi cleanup còn hiện metadata để thử lại. |
| [audio API](../../../app/api/speech/audio/route.ts): `GET` | Cookie/session verified→SQL owner→private file, no-store/nosniff/full200 ≤3MB, không hứa range206. |
| [UI](../../../app/speech/page.tsx): `SpeechSession`, `SpeechPage` | Mic/codec/import/preview/consent/requestId, background history polling, stale-fetch fence, bounded recorder cleanup, server result không score; CSS tại [speech.css](../../../app/speech/speech.css). |
| [migration005](../../../migrations/005_local_speech.sql) | FK user, unique(user,request), partial one-pending index, statuses/metadata/retention. |

Hợp đồng result: id/status/reference/transcript/error/created_at/model/engine/elapsed_ms, không disk paths/user_id của người khác, không pronunciationScore. History chỉ user hiện tại, giới hạn30. Capabilities disabled/offline/configured tách khỏi operational inference/quality verification. API khi lỗi chưa cấu hình503, input400/413, stale idempotency409, ownership404, quá nhiều tác vụ429. Job không có speech/timeout thành failed có thông báo phù hợp; audio vẫn nghe/xóa được nếu còn quyền.

Nội dung field thực trả camelCase từ speechView: createdAt/elapsedMs/durationSeconds/audioRemoved. Job view status staging/queued/active/completed/failed/deleted; deleted chỉ còn hiển thị khi cleanup file pending. Transcript/reference bị xóa ngay khi DELETE, metadata nonce/hash tombstone tối đa7 ngày khi worker hoạt động. Durée container không có không bị coi là audio rỗng; sample count PCM là nguồn duration cuối.

### Bổ sung hợp đồng trước code (API free tier)

`lib/speech/provider.ts`: selectedSpeechProvider, speechServiceReady, heartbeatMatches; fixed provider/model/consent version. `lib/speech/gemini.ts`: transcribeGeminiWav, SpeechServiceError; fixed endpoint/model, JSON validation, timeout, atomic budget. `transcribeLocal` giữ tên entrypoint tương thích nhưng dispatch provider optional sau normalize; worker dùng row.provider snapshot. API thêm capabilities.provider/externalProcessing/consentVersion và POST.provider bắt buộc; speechFingerprint nhận provider để chống reuse nonce consent khác. `migrations/006_speech_provider.sql` thêm provider/consent_version. Không thêm embedding score hoặc sửa shape pronunciationAssessment=false.

Transcript schema chỉ yêu cầu text không rỗng/đúng JSON/finishReason STOP, không là language detector. Từ mượn/viết tắt Latin hợp lệ không bị loại chỉ vì không có Hangul; không trả score phát âm. UI khóa acquisition microphone đang chờ, callback sau unmount dừng stream/không set state.
