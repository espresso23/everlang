# Audit tích hợp speech self-study — 2026-10-31

Branch feature/self-hosted-audio. Canonical [speech audit](../features/self-hosted-speech/audit.md), [evidence](../features/self-hosted-speech/assets/verification.md). Phạm vi: /library entry → /speech → identity-auth verified session → API → SQL private attempts/volume → speech queue/worker → local CPU/Gemini → poll/playback/delete. Không gọi worker grading hoặc sửa SRS schedule.

| Kết nối | Kết quả | Bằng chứng |
|---|---|---|
| Auth→speech APIs/owner | PASS | Actual2-account signup/verify/session, anonymous401/cross-owner404 |
| Library→speech screen | PASS | Final disabled-mode E2E /library→/speech click; direct route desktop/mobile authenticated passed |
| API→SQL/FS→queue→native→SQL→UI | PASS | Real Korean TTS/WAV/WebM,no mocked native output; nonce/duration/quiet/delete |
| API→queue→Gemini→error→UI | PASS failure flow / NOT VERIFIED successful inference | Real Google requests time out; retry bounded, failed/null transcript, private audio remains playable |
| Provider/consent switch | PASS contract / NOT VERIFIED race | Payload provider409/old version400, snapshot guard reviewed; active switch stress pending |
| Private media→backup/restore | PASS | Restored metadata row + original WebM SHA match; temporary resources removed |
| API quota→Redis | PASS internal guard | Atomic25 concurrent attempts20accepted/5blocked, fake transport; no Google quota claim |
| Typography/responsive | PASS partial | Inspected desktop/mobile320 screenshots, no page overflow; actual screen reader/hardware permission pending |
| Platform rollback→new additive schema | PASS bootstrap / NOT VERIFIED full regression | Rebuilt cc1c776 image,/sign-in200; no table/volume drop |

Phát hiện riêng khi review: khóa microphone acquisition đang chờ để tránh nhiều stream/timer; không cấm viết tắt Latin hợp lệ trong transcript JSON; disabled provider trả503. Những sửa này không được coi human audio assessment. Chưa đóng feature/PB-038/full goal khi các mandatory cloud/quality/recovery gates còn mở. Full self-study completion matrix vẫn active.

Final main3000 disabled-mode E2E PASS9.4s, includes503/no upload/local preview and simulated pending/denied mic state. Physical mic and cloud inference still NOT VERIFIED. Source-map/links and final lint/typecheck/unit results recorded in handoff.
