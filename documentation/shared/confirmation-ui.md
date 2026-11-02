# Xác nhận thao tác UI

Chỉ định owner 2026-11-02, [issue #14](https://github.com/espresso23/everlang/issues/14), DS-08. Implemented; bằng chứng và giới hạn tại [audit tích hợp](../audits/confirmation-ui-2026-11-02.md).

[ConfirmationProvider/useConfirmation](../../apps/web/components/confirmation.tsx) được gắn một lần trong [RootLayout](../../apps/web/app/layout.tsx). `useConfirmation()(options)` trả `Promise<boolean>`; options gồm message, confirmLabel, title. Không gọi API từ provider; caller chỉ tiếp tục khi true, giữ nguyên quyền/payload/CAS và xử lý pending/error của nghiệp vụ. Chỉ một quyết định chờ; yêu cầu trùng khi dialog mở trả false, không xếp hàng để replay thao tác. Provider unmount giải quyết false. Mỗi useConfirmation sở hữu AbortController; khi caller unmount, pending decision tự trả false và dialog đóng, không cho tiếp tục hành động từ trang cũ.

Dialog HTML do dự án render/style qua [confirmation.css](../../apps/web/components/confirmation.css), không phải `window.confirm/alert/prompt`. Có tiêu đề/mô tả accessible, nút Hủy mặc định focus, nhãn xác nhận cụ thể, Tab/Shift+Tab tuần hoàn, Escape hủy, nền inert và trả focus về control gọi nếu còn tồn tại. Modal không nhận click backdrop thành xác nhận. Wrap nút/nội dung, cuộn khi cao, dùng token surface/ink/Cobalt hiện hành.

Link cần guard phải preventDefault ngay trước await, lưu href rồi router.push chỉ khi true. `EditorialDesk.onSelect` hỗ trợ Promise và chỉ đổi active item khi callback không trả false. LegacyDraftImport khóa nút trong khi nhập; các caller còn lại giữ busy/error vốn có.

Đã bỏ ba beforeunload guard tại reader/admin knowledge/admin word sets theo yêu cầu không dùng hộp thoại native. Component không thể chặn đóng tab/reload hoặc điều hướng ra ngoài ứng dụng sau khi document bị hủy. Người dùng cần lưu trước; không có autosave/draft recovery mới. Guard SPA toàn ứng dụng/browser Back chưa được mở rộng trong issue này; link back/related và đổi editor hiện có vẫn được bảo vệ bằng component.

[ESLint](../../eslint.config.mjs) chặn no-alert và thuộc tính confirm/alert/prompt trên window/globalThis/self trong apps/web. Đây không phải phân tích alias tổng quát; review vẫn cần rà soát call gián tiếp. Test: [confirmation](../../tests/e2e/confirmation.spec.ts), [editorial desk](../../tests/e2e/editorial-desk.spec.ts). Mock API chứng minh UI, không chứng minh auth/PostgreSQL/provider thật.
