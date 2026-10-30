# Function description — daily-dashboard

[Đặc tả và contract](README.md) · [System design](system-design.md)

## File + symbol → trách nhiệm

Các callback vô danh nằm trong component/handler được mô tả cùng component chủ. Schema/constant có thể là binding chứ không phải hàm; không tạo thêm API ngoài code.

| Code/symbol | Chữ ký/binding hiện tại | Hành vi, I/O và side effect |
|---|---|---|
| [app/page.tsx](../../../app/page.tsx) · `Home` | `export default function Home()` | Component/type `Home` thuộc luồng dashboard và lịch học; hành vi và trạng thái UI ở [ui.md](ui.md). |
| [components/dashboard.tsx](../../../components/dashboard.tsx) · `Dashboard` | `export default function Dashboard()` | Component/type `Dashboard` thuộc luồng dashboard và lịch học; hành vi và trạng thái UI ở [ui.md](ui.md). |
| [components/dashboard.tsx](../../../components/dashboard.tsx) · `change` | `async function change(taskId: string, action: string)` | Hàm/binding `change` phục vụ dashboard và lịch học; input/return và side effect xem chữ ký và module nguồn, không phải API độc lập. |
| [app/api/dashboard/route.ts](../../../app/api/dashboard/route.ts) · `GET` | `export const GET` | Handler `GET`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |
| [app/api/dashboard/route.ts](../../../app/api/dashboard/route.ts) · `PATCH` | `export const PATCH` | Handler `PATCH`; payload, output và mã lỗi theo các hợp đồng ở [đặc tả](README.md). Guard chung áp dụng nếu route dùng api(). |
| [lib/learning/schedule.ts](../../../lib/learning/schedule.ts) · `localDay` | `export function localDay(date: Date, timezone: string)` | Chuyển thời điểm sang ngày YYYY-MM-DD theo IANA timezone. |
| [lib/learning/schedule.ts](../../../lib/learning/schedule.ts) · `makePlan` | `export function makePlan( budget: number, due: number, draftIds: string[], weak: string / undefined, newId?: string, ): DailyTask[]` | Chọn task theo budget và thứ tự ưu tiên, giảm bài mới khi review đầy. |
| [lib/learning/schedule.ts](../../../lib/learning/schedule.ts) · `streak` | `export function streak(days: string[], today: string)` | Đếm ngày học duy nhất liên tục tính tới hôm nay/hôm qua. |

## Input, output và lỗi theo điểm vào

- GET /api/dashboard — {profile,plan,dueCount,stats,streak,errors}.
- PATCH /api/dashboard — {day,version,taskId,action:done|skipped|pending|replace}; 409 stale/day rollover.

profiles, vocabulary, drafts, submissions, daily_plans, study_days; Mongo cấp bài mới. Lịch ngày đã tạo không tái sinh vì refresh.

Auth/validation/error được xác định ở [api.ts](../../../lib/api.ts) và schema trong module tương ứng. Việc một route/hàm có tồn tại không chứng minh provider đã chạy thành công; xem [audit](audit.md).

Dashboard bổ sung span editorial-title và artwork quote/vertical/data-word tại vị trí hero-art hiện có; tất cả decoration aria-hidden, không sửa data/task contract. [Design source](../design-system/functions.md).

Không đổi Dashboard API/state; màu sổ tay/date/task/title do [editorial.css](../../../app/editorial.css) chịu trách nhiệm theo design-system. Empty/filled data được kiểm bằng UI fixture riêng, không ghi DB.
