# Audit — partial verification, gates open

2026-10-31 · feature/self-hosted-audio · baseline28957ad + working changes. Separate review: spec → API/worker/SQL/volume → actual native integration → screenshot inspection. [Evidence](assets/verification.md).

| Requirement | Result | Evidence / limit |
|---|---|---|
| SHS-01 import/preview/consent/max20s/3MB | PASS partial | Unit limits + desktop/mobile E2E; physical microphone/permissions NOT VERIFIED |
| SHS-02 auth/ownership/idempotency/background status | PASS | Actual2-user API→PG→queue→worker→volume→UI; crash/restart recovery NOT VERIFIED |
| SHS-03 local runtime/model | PASS partial | Pinned source/modelSHA, native actual Korean TTS transcript; no broad human benchmark/whole stack sizing |
| SHS-04 private playback/delete/restore | PASS | HTTP owner/no-store/byte comparison, deleted blocking, real PG+volume restore hash. Race stress pending |
| SHS-05 real transcript metadata/no false score | PASS | Model result/reference separation; errors no fabricated transcript; pronunciation NOT IMPLEMENTED |
| SHS-06 disabled/worker unavailable | PASS contract / NOT VERIFIED runtime outage | Config/heartbeat unit; no fault injection for crash/restart |
| SHS-07 free API | NOT VERIFIED | Code present, key1returned402; key2timeouts. No billing changes or paid fallback |
| SHS-08 provider consent/snapshot | PASS partial | Strict contract, wrong provider409/consentVersion400, worker snapshot guard reviewed; provider swap while active not stress-tested |
| SHS-09 cloud normalization/error/quota | PASS contract / NOT VERIFIED inference | PCM/unit/schema/timeout/quota transport tests; actual API did not produce transcript |
| Editorial/responsive | PASS partial | Screenshots inspected desktop+320, no overflow; actual screen reader/zoom/hardware NOT VERIFIED |
| Migration/backup | PASS | Additive005/006, metadata+audio restore drill; app rollback broad auth regression not repeated |

Findings corrected during review: missing container duration for streaming WebM now uses decoded PCM bounds; delete/file stage race serialized by row lock; invalid native CPU flags fall back; Next private FS tracing suppressed with supported comment and private artifact excludes; provider/version consent snapshot prevents silent cloud conversion. Native word latency31s motivated AVX2 selection, not a claim of validated low latency for every machine.

Not Done: human content/quality acceptance, cloud working inference, microphone/accessibility/recovery gates. Do not close PB-020/026 or full goal from this enabler. No embedding-derived pronunciation score implemented.

API failure integration1.7min PASS for error pipeline/consent/private browser decoding; Google inference still timed out. [Detailed checkpoint](assets/verification.md). Distinguish tested failure UI from successful API availability.

Final deployed disabled-mode check: main localhost3000 updated, E2E6.6s (suite9.4s) PASS /library→/speech, unauth401, disabled503, local import preview duration>0, consent không bật gửi khi offline; injected pending/denied microphone promise kiểm loading/1 acquisition/re-enable/giữ preview. Đây là UI platform-contract simulation, không physical microphone. Standalone container không chứa .local/.env/.git/test-results; no speech worker running by default.

## 2026-10-31 — Kho hệ thống và xử lý exception worker

Branch `bugfix/sample-audio-player`, HEAD13d432b + working changes. PASS theo phạm vi ghi nhận:70unit, Redis cooldown/PG idle reconnect/fatal child probes,2real library E2E34.4s và UI scoped. Xem [audit tích hợp](../../audits/system-library-worker-errors.md) cho yêu cầu/code/steps/evidence/cleanup và final build/deploy. NOT VERIFIED với live provider recovery, speech hardware, chất lượng nội dung/điểm phát âm và các gate legacy ngoài phạm vi. Không coi toàn feature Done.
