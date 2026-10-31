# Speech verification — 2026-10-31

Branch feature/self-hosted-audio, primary D:/Project/langz. Baseline28957ad; this working change. No real learner voice in committed evidence.

## Evidence

- `npm test`:49/49 unit tests,7 files; `npx tsc --noEmit`, `npm run lint` PASS at initial adapter checkpoint. Includes CPU flags, base64/signature/size/identity/consent, safe paths/hash, PCM quiet/duration, projection, fixed Gemini endpoint/header/no reference, Redis budget failclosed, malformed/refused/truncated results,429/5xx/transport errors. Fake transport tests are contract tests, not Google inference evidence.
- Docker app production build and standalone succeeded,37 routes; native portable+AVX2 binaries compiled from pinned whisper.cpp1.9.5 source. Model147951465bytes fullSHA256 matches contract, repeat setup skipped verified model.
- `E2E_SPEECH=1 E2E_SPEECH_BACKUP=1 E2E_BASE_URL=http://localhost:3001 npx playwright test tests/e2e/speech.spec.ts`:1 passed28.9s (test25.2s), **actual Whisper CPU**. Two disposable verified email accounts + real PG/Redis/private volume; no mocked provider. Anonymous401, strict input400, wrong provider409, old consent400, concurrent duplicate202 sameID, nonce change409, cross-user read/play/delete404, transcript Korean and no supplied fake reference, audio bytes match original/no-store, silence/21s rejected, streaming WebM lacking Duration decodes, delete blocks playback/id and nonce410, desktop/mobile320 no page overflow.
- [Desktop](speech-desktop.png), [mobile](speech-mobile.png) inspected: paper/ink/Cobalt, two panels, no black fill/score. Private player preload=none initially shows0:00; browser decode/playback gate checked separately in API probe, not inferred from screenshot.
- Fixture source: self-authored TTS on Windows Microsoft Heami Desktop ko-KR: word 학교; sentence 안녕하세요. 저는 매일 한국어를 공부해요. Private `.local/speech-fixtures`, not a human quality corpus or redistributable lesson audio. Silence PCM synthetic for input rejection. No actual physical microphone/hardware hearing verified.
- Portable word probe transcript 학교.,1.274331s input,31017ms ASR; busybox time wall34.43s/maxRSS287016KB for measured process tree, not total stack. Optimized native sentence result screenshot6.7s for different input; **do not calculate speedup across these different fixtures**. Whole-platform minimum hardware not established.
- Before005 PG backup and before006 new PG backup; migrations additive applied,005 not edited after application. Quiesced speech worker after E2E; pg_dump + private volume tar, restored into explicitly temporary database+volume, completed WebM row present and restored audio SHA matches original. Temporary restore resources removed. Actual backups private `.local/backups`, never committed. Old app ignores added tables; no down/drop migration run.

## Google probes (availability, not quality)

Official pricing read2026-10-31 supports Free tier Gemini3.8Flash and audio GeminiEmbedding2, subject quota; Google may use free-tier data to improve products. https://ai.google.dev/gemini-api/docs/pricing . Audio API and REST contract: https://ai.google.dev/gemini-api/docs/audio and https://ai.google.dev/api/generate-content . Embeddings target semantic search/classification/clustering: https://ai.google.dev/gemini-api/docs/embeddings ; no evidence here validates cosine similarity as Korean pronunciation score.

- Model metadata/list returned200 but2.5Flash generateContent404 “no longer available to new users”; switched explicit pinned model3.8Flash in spec/code (no automatic model fallback).
- First key3.8Flash returned402 RESOURCE_EXHAUSTED/prepaid credits depleted. No billing/credit changes made.
- Owner changed key; word-audio adapter45s timed out; minimal text20s timed out; one low-thinking audio45s probe also timed out. No transcript, score or free-tier availability success claimed. Current adapter keeps bounded45s timeout/2 queue attempts, no paid fallback. Low-thinking probe is not a deployed setting.
- Key values, upstream raw bodies, auth tokens and private voice not recorded. Only safe status/messages documented.

## Remaining gates

Google successful Korean inference, human learner benchmark/pronunciation calibration, physical microphone/codec/device accessibility, multi-device recording concurrency/restart/idempotency recovery chaos, total resource baseline. Test success of safe failure UI does not certify API availability or language efficacy. Feature remains implemented with audit gates open; full self-study goal remains active.

## API failure integration checkpoint

`E2E_SPEECH=1 E2E_SPEECH_ALLOW_FAILURE=1 E2E_BASE_URL=http://localhost:3001 npx playwright test tests/e2e/speech.spec.ts`:1 passed1.7min, **availability/failure handling only**. Actual Google transport timed out, queue retried within bound and SQLstatus failed/transcript null; no fake inference. Same2-user strict contract/ownership/idempotency checks; UI provider name/Google consent visible, send disabled before consent; authenticated saved audio loaded metadata and playback currentTime advanced in Chromium (muted functional test, no hardware hearing claim). [API desktop](api-unavailable-desktop.png), [mobile320](api-unavailable-mobile.png) inspected, no page overflow. QA accounts/files cleaned after probe; temporary containers removed. Full strict successful-Gemini E2E remains NOT VERIFIED.

## Quota/rollback checks

- Actual Redis atomic Lua daily counter under25 concurrent attempts (separate QA namespace), fake transport/no cloud calls:20 accepted/5 rejected. QA key removed; real daily budget not reset. Confirms concurrency guard, not Google quota.
- Tagging original running app image failed because Docker image object no longer existed; rebuilt tracked cc1c776 source into `everlang-before-speech:local`. Candidate3002 `/sign-in` returned200 against current additive schema. This is bootstrap compatibility, not every old login/knowledge behavior retested. Temporary rollback container removed; image retained.

## Final deployed mode

After final mic-acquisition guard and disabled503 correction, production app image rebuilt and running localhost3000 with SPEECH_PROVIDER=disabled, no speech worker enabled by default (owner requested API/low resource; cloud not verified, no automatic native fallback). `E2E_SPEECH=1 E2E_SPEECH_DISABLED=1 E2E_BASE_URL=http://localhost:3000 npx playwright test tests/e2e/speech.spec.ts`:1 passed9.4s (test6.6s). Library entry click→speech,503 disabled API, import/audio metadata, send remains disabled despite consent; injected pending/denied browser mic checks one acquisition/loading/re-enable/retained preview, no real hardware claim. `docker exec` existence-only check: .local/.env/.git/test-results absent from standalone. Reserved QA accounts/files cleaned; no private fixtures in Git.
