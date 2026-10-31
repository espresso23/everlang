# Function description — implemented, audit pending

| File / symbol | Contract / hành vi |
|---|---|
| [knowledge-contract.ts](../../../lib/knowledge-contract.ts): `knowledgeSchema`, `knowledgeKey`, `stateSchema` | Strict Zod, giới hạn text/array, ID duy nhất, đáp án choice hợp lệ, từ chối identity phía client. |
| [knowledge-contract.ts](../../../lib/knowledge-contract.ts): `publicEntry` | Loại answers/explanation và reviewer khỏi learner detail trước submit. |
| [knowledge-contract.ts](../../../lib/knowledge-contract.ts): `normalizeKnowledgeAnswer`, `gradeKnowledge` | Grade choice exact; cloze NFC/whitespace/punctuation, giữ ranh giới từ; feedback answer/explanation chỉ sau submit. |
| [knowledge.ts](../../../lib/knowledge.ts): `getKnowledge`, `publicKnowledge`, `listKnowledge`, `knowledgeTitles` | Mongo published-only; latest mỗi key trước filter; escape regex, alias idiom/quán dụng ngữ; limit100 metadata. Revision cụ thể chỉ service attempts dùng; titles resolve published metadata cho relatedItems/sổ đọc. |
| [Knowledge.ts](../../../lib/models/Knowledge.ts): `Knowledge` | Mongo unique key/revision, content đã Zod validate, status/editVersion/reviewer. |
| [learner route](../../../app/api/knowledge/route.ts): `GET` | key detail hoặc q/kind/level/topic list; api guard session và verified email. |
| [state route](../../../app/api/knowledge/state/route.ts): `GET/PUT` | GET key: chỉ state của user; GET không key: tối đa100 bookmark/đọc tiếp metadata có title; PUT revision hiện hành/section hợp lệ/CAS version, 409 giữ dữ liệu client. |
| [attempt route](../../../app/api/knowledge/attempts/route.ts): `POST` | Validate đủ câu, lấy published revision, lưu snapshot/result SQL; user/requestId unique; replay giống payload trả kết quả cũ, khác payload409. |
| [admin route](../../../app/api/admin/knowledge/route.ts): `GET/POST/PATCH` | Admin-only; create/edit/review/publish/fork/revise; reviewed chưa publish có thể trả draft để sửa, xóa reviewer; CAS, immutable published; publish chặn related missing/self, editor chọn các bản published. |
| [reader](../../../app/knowledge/page.tsx): `KnowledgePage`, `KnowledgeBrowser`, `Reader` | Suspense/searchParams, filters và sổ đọc, notes explicit save, exercises, TTS kiểm giọng ko, SRS existing API; không dùng HTML thô. |
| [editor](../../../app/admin/knowledge/page.tsx): `KnowledgeAdmin` | Field editor các phần/ví dụ/câu hỏi; xác nhận người duyệt, tạo revision; dirty warning; API kiểm quyền cuối cùng. |
| [seed](../../../scripts/seed-knowledge.ts): `seedKnowledge`; [data](../../../data/knowledge-seed.ts): `knowledgeSeed` | Validate toàn bộ corpus trước ghi; upsert revision1 draft, không sửa nội dung cũ hoặc tự publish. |
| [migration004](../../../migrations/004_knowledge.sql) | knowledge_state và knowledge_attempts, FK user cascade, uniqueness CAS/requests. |

POST attempts nhận key, revision, answers, requestId; public projection không gửi đáp án hoặc explanation. Canonical comparison chuẩn hóa NFC, trim/whitespace và punctuation cho cloze, không bỏ mọi khoảng trắng tiếng Hàn. MCQ so chỉ số lựa chọn.

GET list chỉ metadata và filter bounded, không tải cả corpus vào browser. Draft/review API admin không dùng chung learner projection; lần fetch lỗi không được biến thành danh sách rỗng thành công. Seed gồm13 draft (5 grammar, 3 idiom, 2 proverb, 1 Hanja, 1 collocation, 1 phonetics), chưa là corpus đã người duyệt chấp nhận.
