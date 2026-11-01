# Sample audio player

Owner: translation-practice; consumer: immersive-learning.

- [SampleAudioPlayer / Playback](../../apps/web/components/sample-audio-player.tsx): props `text`, optional `label`, `compact`; keyed Playback resets on changed text, unmount cancels its active utterance and interval.
- [Styles](../../apps/web/components/sample-audio-player.css): Editorial tokens, 44px button, compact210px variant for repeated sentences/reference answer, progress and tabular elapsed clock, wrapping error, loading spinner respects reduced motion.
- Callers: [AnswerInput / AnswerDetails](../../apps/web/components/practice.tsx) and [Library](../../apps/web/app/library/page.tsx): every read sentence, first dictation sentence and speak sample. Dictionary/knowledge/catalog-specific pronunciation actions are outside this player scope.
- Browser SpeechSynthesis ko-KR, rate0.88. Start/loading (10s timeout), play/pause/resume, boundary position / text length, end100%, replay0%, canceled/interrupted resets state, actual failure alert. Empty text disabled, unsupported browser alert. No backend or data changes.
- Elapsed clock measures active playback excluding pauses. Browser TTS has no media duration or seek contract: progress is text position, not a seek control; browsers without boundary events keep progress0 until end. No fabricated total duration. Korean voice and physical audio quality remain device-dependent.
- [Lifecycle/browser smoke](../../tests/e2e/sample-audio.spec.ts) simulates speech events; it does not validate acoustic output. [Audit integration](../audits/sample-audio-player.md).

## Follow-up sentence controls —2026-10-31

- `PlaybackOwner`, module `activePlayback` and `release`: only one shared player owns speech at a time. New playback explicitly stops/resets old UI and detaches callbacks before cancellation, even if the browser emits no cancel event. Unmount only cancels the utterance it owns; closing an inactive answer does not cancel another playing sample.
- Switching lesson uses stable lesson/segment keys; listen and speak players have distinct lesson/tab keys. Tab buttons expose aria-pressed, selected lesson aria-current. No backend/data/provider change.
- Accessible names follow the action context: Nghe câu1/2/3, Nghe câu đầu tiên, Nghe mẫu, Nghe đáp án mẫu/tham khảo; pause/resume include that label. Live status announces start/pause/end/loading, spinner and aria-busy mark loading, failed/unsupported/timeout alerts remain adjacent. No fake total duration/seek.
- Regression includes read→dictation→speak, change lesson, pause→other sentence, canceled-event absence, completed/error/replay, loading timeout, unsupported browser, and inactive reference unmount while another answer plays. Responsive screenshots cover1440/390/320 and text-spacing override. [Audit](../audits/sentence-audio-controls.md).
