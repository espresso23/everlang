# Function description — translation-practice

[Đặc tả và contract](README.md) · [System design](system-design.md)

## File + symbol → trách nhiệm

Các callback vô danh nằm trong component/handler được mô tả cùng component chủ. Schema/constant có thể là binding chứ không phải hàm; không tạo thêm API ngoài code.

| Code/symbol | Chữ ký/binding hiện tại | Hành vi, I/O và side effect |
|---|---|---|
| [app/practice/page.tsx](../../../app/practice/page.tsx) · `Page` | `export default async function Page(` | Component/type `Page` thuộc luồng luyện dịch tiếng hàn; hành vi và trạng thái UI ở [ui.md](ui.md). |
| [components/practice.tsx](../../../components/practice.tsx) · `apiErrorMessage` | `function apiErrorMessage( response: Response, message?: string, fallback = "Có lỗi xảy ra.", )` | Hàm/binding `apiErrorMessage` phục vụ luyện dịch tiếng hàn; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [components/practice.tsx](../../../components/practice.tsx) · `SaveKnowledge` | `function SaveKnowledge(` | Mở kho từ với query điền sẵn; không tự lưu thẻ. |
| [components/practice.tsx](../../../components/practice.tsx) · `KoreanLinkedText` | `function KoreanLinkedText(` | Tách đoạn tiếng Hàn thành nút gửi event mở tra cứu. |
| [components/practice.tsx](../../../components/practice.tsx) · `Practice` | `export default function Practice(` | Component/type `Practice` thuộc luồng luyện dịch tiếng hàn; hành vi và trạng thái UI ở [ui.md](ui.md). |
| [components/practice.tsx](../../../components/practice.tsx) · `changeFilter` | `function changeFilter(which: "topic" / "level", value: string)` | Hàm/binding `changeFilter` phục vụ luyện dịch tiếng hàn; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [components/practice.tsx](../../../components/practice.tsx) · `saveDraft` | `function saveDraft(id: string, value: string)` | Hàm/binding `saveDraft` phục vụ luyện dịch tiếng hàn; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [components/practice.tsx](../../../components/practice.tsx) · `speak` | `function speak(text: string)` | Hàm/binding `speak` phục vụ luyện dịch tiếng hàn; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [components/practice.tsx](../../../components/practice.tsx) · `submit` | `async function submit(item: Sentence, forceRegrade = false)` | Hàm/binding `submit` phục vụ luyện dịch tiếng hàn; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [components/practice.tsx](../../../components/practice.tsx) · `viewSaved` | `async function viewSaved(item: Sentence)` | Hàm/binding `viewSaved` phục vụ luyện dịch tiếng hàn; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [components/practice.tsx](../../../components/practice.tsx) · `openLibrary` | `async function openLibrary(which: "reviews" / "favorites")` | Hàm/binding `openLibrary` phục vụ luyện dịch tiếng hàn; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [components/practice.tsx](../../../components/practice.tsx) · `toggleFavorite` | `async function toggleFavorite(item: Sentence)` | Hàm/binding `toggleFavorite` phục vụ luyện dịch tiếng hàn; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [components/practice.tsx](../../../components/practice.tsx) · `toggleAnswer` | `function toggleAnswer(id: string)` | Hàm/binding `toggleAnswer` phục vụ luyện dịch tiếng hàn; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [components/practice.tsx](../../../components/practice.tsx) · `copyText` | `async function copyText(text: string)` | Hàm/binding `copyText` phục vụ luyện dịch tiếng hàn; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [components/practice.tsx](../../../components/practice.tsx) · `SourceText` | `function SourceText(` | Component/type `SourceText` thuộc luồng luyện dịch tiếng hàn; hành vi và trạng thái UI ở [ui.md](ui.md). |
| [components/practice.tsx](../../../components/practice.tsx) · `AnswerInput` | `function AnswerInput(` | Component/type `AnswerInput` thuộc luồng luyện dịch tiếng hàn; hành vi và trạng thái UI ở [ui.md](ui.md). |
| [components/practice.tsx](../../../components/practice.tsx) · `AnswerDetails` | `function AnswerDetails(` | Component/type `AnswerDetails` thuộc luồng luyện dịch tiếng hàn; hành vi và trạng thái UI ở [ui.md](ui.md). |
| [components/practice.tsx](../../../components/practice.tsx) · `VocabHints` | `function VocabHints(` | Component/type `VocabHints` thuộc luồng luyện dịch tiếng hàn; hành vi và trạng thái UI ở [ui.md](ui.md). |
| [components/practice.tsx](../../../components/practice.tsx) · `HintPanel` | `function HintPanel(` | Component/type `HintPanel` thuộc luồng luyện dịch tiếng hàn; hành vi và trạng thái UI ở [ui.md](ui.md). |
| [components/practice.tsx](../../../components/practice.tsx) · `ExerciseCard` | `function ExerciseCard(` | Render bài dịch, input, yêu thích, gợi ý và nút thao tác. |
| [components/practice.tsx](../../../components/practice.tsx) · `EmptyLibrary` | `function EmptyLibrary(` | Component/type `EmptyLibrary` thuộc luồng luyện dịch tiếng hàn; hành vi và trạng thái UI ở [ui.md](ui.md). |
| [components/practice.tsx](../../../components/practice.tsx) · `GradeModal` | `function GradeModal(` | Render điểm, lỗi, gợi ý, rewrites và chấm lại. |
| [components/practice.tsx](../../../components/practice.tsx) · `FeedbackSection` | `function FeedbackSection(` | Component/type `FeedbackSection` thuộc luồng luyện dịch tiếng hàn; hành vi và trạng thái UI ở [ui.md](ui.md). |
| [components/practice.tsx](../../../components/practice.tsx) · `DictionarySelectionLookup` | `export function DictionarySelectionLookup()` | Đọc selection/click, đặt popup trong viewport và dùng useLookup. |
| [components/practice.tsx](../../../components/practice.tsx) · `openLookup` | `function openLookup(word: string, bounds: DOMRect)` | Hàm/binding `openLookup` phục vụ luyện dịch tiếng hàn; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [components/practice.tsx](../../../components/practice.tsx) · `inspectSelection` | `function inspectSelection()` | Hàm/binding `inspectSelection` phục vụ luyện dịch tiếng hàn; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [components/practice.tsx](../../../components/practice.tsx) · `handleAutoLookup` | `function handleAutoLookup(event: Event)` | Hàm/binding `handleAutoLookup` phục vụ luyện dịch tiếng hàn; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [components/practice.tsx](../../../components/practice.tsx) · `dismissOutside` | `function dismissOutside(event: PointerEvent)` | Hàm/binding `dismissOutside` phục vụ luyện dịch tiếng hàn; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [components/practice.tsx](../../../components/practice.tsx) · `speakSelection` | `function speakSelection()` | Hàm/binding `speakSelection` phục vụ luyện dịch tiếng hàn; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [components/practice.tsx](../../../components/practice.tsx) · `DictionaryResultCard` | `function DictionaryResultCard(` | Render loại từ, phiên âm, nghĩa và liên kết KRdict. |
| [components/practice.tsx](../../../components/practice.tsx) · `useLookup` | `function useLookup( word: string, setLookup: (value: DictionaryLookup / null) => void, setError: (value: string) => void, )` | Fetch dictionary có AbortController, cập nhật loading/result/error. |
| [app/api/sentences/route.ts](../../../app/api/sentences/route.ts) · `runtime` | `export const runtime` | Hàm/binding `runtime` phục vụ luyện dịch tiếng hàn; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [app/api/sentences/route.ts](../../../app/api/sentences/route.ts) · `dynamic` | `export const dynamic` | Hàm/binding `dynamic` phục vụ luyện dịch tiếng hàn; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [app/api/sentences/route.ts](../../../app/api/sentences/route.ts) · `handleGet` | `async function handleGet(request: NextRequest, viewer: Viewer)` | Hàm/binding `handleGet` phục vụ luyện dịch tiếng hàn; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [app/api/sentences/route.ts](../../../app/api/sentences/route.ts) · `GET` | `export const GET` | Handler `GET`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |

## Input, output và lỗi theo điểm vào

- GET /api/sentences — topic,level,page,limit,search,sentenceId,mistakes; {items,page,limit,total,pages}.

Học liệu MongoDB; nháp/report/favorites PostgreSQL; dictionary có cache Redis. Search phía server dùng regex escape cần audit riêng ở cạnh trường hợp ký tự đặc biệt.

Auth/validation/error được xác định ở [api.ts](../../../lib/api.ts) và schema trong module tương ứng. Việc một route/hàm có tồn tại không chứng minh provider đã chạy thành công; xem [audit](audit.md).
