# EverLang Editorial — quy chuẩn frontend

Trạng thái: implemented; xác minh và giới hạn tại [audit](../features/design-system/audit.md). Đặc tả triển khai 2026-10-30, branch `feature/editorial-design-system`. Quy chuẩn này thay palette lemon/cobalt cũ; [design-system](../features/design-system/README.md) là feature owner.

## Hướng thiết kế và bất biến

Lấy cảm hứng Art Gallery / Surrealist Editorial: mặt giấy sáng, mực đen, cobalt; chữ tạo hình ảnh. Input search giữ text inset pl-10 đã có trong markup để không đè icon; không đổi khung field. Giữ nguyên thứ tự DOM, route, lưới, vị trí cột, container width, padding, gap và breakpoint của wireframe hiện hành. Không đưa collage/ảnh trang trí vào bài học, không neo brutalism, không gradient, không bóng nổi. Logo chữ e và ngôi sao giữ nguyên hình; ngôi sao chuyển màu mực theo palette mới.

Font thay đổi có thể gây reflow nội dung tự nhiên; không cố định chiều cao bài đọc để ép khớp ảnh. Không dùng absolute positioning cho nội dung cần đọc hoặc thao tác. Trang trí nằm trong khoảng trống của artwork đang có, không chiếm thêm cột/section.

## Token chuẩn

Nguồn thực thi: [design-tokens.css](../../apps/web/app/design-tokens.css), [editorial.css](../../apps/web/app/editorial.css), [layout](../../apps/web/app/layout.tsx). Font Inter Variable self-host qua package Fontsource, có Vietnamese; Hangul fallback Malgun Gothic/Noto Sans KR/system sans. Không gọi Google Fonts khi mở trang.

| Token / vai trò | Giá trị |
|---|---|
| --paper / nền trang | #F4F4F2 |
| --surface / nội dung, form | #FFFFFF |
| --ink / chữ chính | #111111 |
| --muted / chú thích đọc được | #595959 |
| --brand / CTA, link, chọn, số | #244CE0 |
| --brand-dark / hover | #1838AE |
| --tint / vùng phụ | #EEF1FF |
| --line / phân cách | #D8D8D4 |
| --control-line / biên input | #858585 |
| --positive, --negative | #166534, #B42318; chỉ cho feedback học tập |

Không thêm màu thương hiệu mới theo từng feature. Semantic đúng/sai luôn có chữ/icon tương ứng, không chỉ màu. Màu xám viền card là trang trí; biên control quan trọng dùng --control-line. Palette không được quảng cáo như bằng chứng tâm lý tăng trí nhớ.

## Typography và ngôn ngữ

- UI Latin/Vietnamese: Inter Variable 400 body, 500 nhãn, 650 menu, 800–850 heading chính; auth panel600 và SRS650 là cấp phụ theo khung hiện có. Font size/line-height của các khối hiện hành giữ để không đổi khung; hero 43px desktop/33px mobile, page title31px, section20px, body học14–16px, class .small và vocab-row small12px; metadata cũ10–11px giữ trong wireframe, artwork8–10px chỉ trang trí aria-hidden. Không dùng chữ metadata nhỏ làm hướng dẫn học chính.
- H1/H2 và tiêu đề giao diện in hoa bằng CSS; giữ nguyên text node/accessible name. Heading tracking -0.035em; nhãn/menu .06–.12em. Không dùng uppercase cho câu mẫu, đáp án, từ người học, tên người, từ vựng hoặc nội dung tiếng Hàn.
- Nội dung học dùng sentence case, weight400–500, line-height1.7–1.85, tracking bình thường; Hangul không bị tracking rộng, in nghiêng hay font quá mảnh. Từ ôn SRS là nội dung, không phải headline quảng cáo.
- Tiêu đề section dùng chữ ink trên nền sáng, không đặt nền đen sau chữ hoặc đảo trắng/đen. Card đọc dài và sổ tay dùng surface/paper; nhãn ngày/Beta/task dùng tint nhẹ. Số thống kê Cobalt/tabular; lớp chữ artwork là tint nhẹ, không mực đen dày.
- Vertical text và ngoặc kép lớn chỉ mang tính trang trí: aria-hidden, pointer-events:none; không nằm trong tab order. Ẩn chi tiết này trên màn hình nhỏ hoặc vùng đọc. Không xoay menu, CTA hoặc hướng dẫn.

## Hợp đồng component và UX học ngôn ngữ

| Component | Quy tắc |
|---|---|
| Header/nav | Vị trí cũ; e logo, avatar/session giữ hành vi. Menu tracking vừa, active cobalt + dấu gạch; không rút gọn nhãn khó hiểu |
| Card/panel | Nền giấy/trắng, viền1px, góc6–8px, không đổ bóng; heading đậm, body bình tĩnh; không biến cả thẻ thành button nếu có control con |
| Button | CTA cobalt/trắng; secondary trắng/mực; disabled rõ, focus-visible luôn có; inverse surface dùng outline trắng. Giữ padding/vùng chạm hiện tại |
| Bài học/editor | Không uppercase input/câu mẫu. Giữ autosave, không che draft/feedback bằng artwork; nội dung dài được wrap và cuộn tự nhiên |
| Báo cáo AI | Lỗi thực sự và gợi ý diễn đạt phân biệt bằng nhãn; không dựa vào đỏ/xanh đơn độc. Không đổi rubric/chấm vì thay theme |
| SRS | Again/Hard/Good/Easy giữ nhãn và thứ tự. Từ/cụm lớn vẫn sentence case/Hangul tự nhiên |
| Dashboard | Ôn đến hạn → bài dở → điểm yếu → bài mới giữ nguyên. Dữ liệu thật, không dùng số trang trí giả làm tiến độ |
| Form/auth | Label hiển thị, lỗi sát form, thông báo tải/thành công rõ; không thay input bằng placeholder; không che session error bằng guest UI |

Một hành động học chính mỗi khối; feedback gần hành động, hiển thị lý do gợi ý và quyền đổi/bỏ lịch. Giữ lời giải sau khi người học chủ động yêu cầu. Không dùng streak gây áp lực, animation liên tục hoặc thẩm mỹ lấn át khả năng đọc.

## Khả năng tiếp cận và kiểm tra

Mục tiêu thiết kế: chữ thường ≥4.5:1, chữ lớn ≥3:1; focus/biên control quan trọng ≥3:1. Tôn trọng text spacing do người dùng đặt và zoom200%; không clip dấu tiếng Việt. Vùng chạm hiện có giữ nguyên; tính năng mới ưu tiên44px, tối thiểu24px hoặc khoảng cách hợp lệ. Không tuyên bố toàn ứng dụng đạt WCAG chỉ vì token đạt.

Nguồn chuẩn: [W3C contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html), [text spacing](https://www.w3.org/TR/WCAG22/#text-spacing), [target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [Fontsource Inter](https://fontsource.org/fonts/inter/use). Các lựa chọn editorial là quyết định thiết kế của EverLang, không phải tiêu chuẩn bắt buộc của mọi learning platform.

## Gate trước bàn giao frontend

1. Đọc tài liệu này và UI/contract của feature; dùng tokens, không thêm theme song song.
2. Đối chiếu wireframe trước/sau: DOM order, grid, width/padding/gap/breakpoint; thay bố cục cần yêu cầu riêng.
3. Kiểm desktop1440/mobile390 và320, tên/nội dung dài, tiếng Việt có dấu/Hangul, keyboard/focus, lỗi/loading/empty, text-spacing override và zoom.
4. Lưu ảnh QA và kết quả audit tại [design-system](../features/design-system/audit.md); cập nhật code map, UI docs và HANDOFF trong cùng thay đổi. Không thay hash để bỏ qua khác biệt chưa review.


## Ngoại lệ layout được yêu cầu: /profile

2026-10-30: người dùng yêu cầu view/edit profile chuyên nghiệp và khác biệt hơn. [Learning Passport](../features/user-profile/ui.md) được phép thay layout: sidebar Cobalt + mục tiêu/nhịp học, inline editor, security/data disclosures. Dùng dữ liệu thật; Cancel/Save rõ, input giữ khi lỗi và focus có quản lý. Mobile identity compact để nhường chỗ cho mục tiêu.

Không dùng ngoại lệ này đổi7 route khác. Structural JSON baseline giữ làm lịch sử; so sánh7 route còn lại, /profile kiểm view/edit/state/error/responsive riêng.

## Cập nhật độ nhẹ thị giác — 2026-10-30

Theo phản hồi về sổ tay bị fill đen: không dùng nền ink cho panel, title label, date/Beta, task hoàn thành hoặc art note. Ưu tiên surface/paper/tint, phân cấp bằng weight/spacing/đường kẻ nhẹ và Cobalt. Sổ tay rỗng dùng vùng paper nhẹ, khi có lỗi giữ negative/positive/ink và link brand; không để màu trắng từ theme cũ kế thừa. Focus trên nền sáng là Cobalt. Passport Cobalt của profile giữ nguyên; modal scrim phục vụ focus vẫn giữ, không phải nội dung học đảo màu. Layout không đổi.

Mobile wordmark được phép scale typography20–22px tại breakpoint760px sẵn có để hỗ trợ text spacing ở320px; giữ nguyên logo e và các tác vụ header, không che nội dung tràn.
