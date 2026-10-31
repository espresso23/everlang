# Mục tiêu triển khai tự học — completion matrix

2026-10-31. Owner yêu cầu triển khai đến khi phần tự học hoàn thành, theo research từ vựng/phát âm và thư viện kiến thức. Mục tiêu giữ **active**, không thu hẹp vào module đã làm hoặc vào pilot dễ kiểm tra. Sprint/capacity vẫn Proposed; các mốc dưới là trình tự phụ thuộc, không hứa lịch.

| Yêu cầu end-state | Tracking / canonical docs | Bằng chứng cần để hoàn tất | Trạng thái hiện tại |
|---|---|---|---|
| Tài khoản, hồ sơ, dữ liệu người học | identity-auth, user-profile | Audit ownership + login/profile end-to-end | Baseline implemented, kiểm regression trong luồng mới |
| Thư viện grammar có cách dùng/ví dụ/so sánh | PB-001/002/005/006, knowledge-library | Content đã owner duyệt + search/detail/comparison/bài tập thật | Library technical integration đã kiểm; content draft, comparison chưa làm |
| Idiom, tục ngữ, Hán-Hàn/cụm từ và tài liệu đọc lại | PB-034, knowledge-library | Các loại nội dung reviewed, tìm/đọc/bookmark/note/resume giữa thiết bị | Đã có reader/state/workflow và integration evidence; chưa duyệt học liệu |
| Bộ từ đời sống → học tập/công việc → ngành nghề | PB-035 | Taxonomy/coverage đã chốt, entry/sense/examples/source/reviewer, học và ôn | Catalog/sense/sets/admin/FSRS đã implement và technical API/browser audit đạt phạm vi ghi nhận;30 sense+23 set nháp chưa duyệt, audio/coverage gate mở; pilot không thay coverage cuối |
| Audio từng từ/câu đúng phiên bản | PB-036 | Playback thật, text/audio phù hợp, quyền dùng và fallback | TTS thiết bị baseline; pipeline audio curated chưa có |
| Luyện nhớ/hiểu và dùng được | PB-003/007/008/018 | Server grading, attempts/snapshot, SRS context/sense và evidence mastery | Bài tập thư viện đang triển khai; mastery và sense chưa có |
| Ngữ âm, thu từ/câu và chấm phát âm | PB-020/026 | Audio thật + provider ko-KR + benchmark được người duyệt chấp nhận | Thu/import/private ASR enabler PB-038 có local E2E/restore; Gemini adapter có, key đổi vẫn timeout. Provider scoring chưa tích hợp/verified; STT không là điểm |
| Đọc/nghe theo đoạn, transcript và chép chính tả | PB-013/014/015/017 | Reviewed corpus/audio, reader/audio sync, lookup và bài tập | Baseline nhỏ; mở rộng chưa thực hiện |
| Hội thoại tình huống và luyện dùng từ | PB-037 | Content có mục tiêu, role/scoring riêng, history/private recordings | Chưa triển khai |
| Lộ trình, diagnostic và lịch học theo mục tiêu | PB-009/010/011 | Onboarding→path→daily plan→practice→review qua hai thiết bị | Dashboard baseline; path/diagnostic chưa thực hiện |
| Luyện viết/dịch và chữa AI đáng tin | PB-004/012, translation-practice/ai-grading | Ground truth reviewed, lỗi vs gợi ý, không phạt dấu câu, reports có version | Baseline có; benchmark cuối chưa được duyệt |
| Quyền và chất lượng corpus | content-authoring + mỗi content PBI | Source/rights/version, owner/editor review, chuyên ngành có người duyệt phù hợp | Workflow triển khai; nội dung mới chưa duyệt |
| Tech, docs, integration và vận hành | PB-021/022/023/024 | 5 docs/feature + code-map; lint/typecheck/unit/integration/build/container/browser, backup/restore | Kiểm theo từng lần bàn giao; chưa final audit toàn mục tiêu |

Không tự coi “Done” khi chỉ có code, khi chưa có audio/provider thật, chưa được content reviewer chấp nhận hoặc khi thiếu hợp đồng. Kiểm lại matrix này mỗi lần bàn giao; tiếp tục phần độc lập nếu thiếu một external input. Bằng chứng đủ theo từng requirement mới cho phép đóng goal.

[Research](../research/self-study-vocabulary-pronunciation.md) · [Tracking source](work-items.json) · [Thư viện kiến thức](../features/knowledge-library/README.md).
