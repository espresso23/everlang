# UI — implemented, audit pending

Route /speech, entry link từ /library; dùng design guide paper/ink/Cobalt, không thay wireframe cũ. Reference có thể từ query câu mẫu, không tự xem là đáp án đã nói. Thuâm tối đa20s hiển thị timer/trạng thái, Stop/Nghe lại rõ, import nếu microphone/codec không hỗ trợ. User chủ động consent trước gửi; blob giữ nếu lỗi. Model xử lý nền hiển thị queued/active/completed/failed, có retry chủ động request mới sau failure, không giả chấm phát âm.

Hiển thị transcript với nhãn Nhận dạng lời nói, model/version và thời gian khi hoàn tất; câu mẫu bên cạnh để đọc lại, không có phần trăm phát âm. History riêng, playback/delete có trạng thái/error; remove row chỉ khi API xác nhận deleted/file cleanup. Khi worker offline vẫn thu/nghe local, disable gửi có lý do. Keyboard, mobile320/390/desktop, missing permission, queued refresh và ownership kiểm trong audit.

## API provider — trước triển khai

Giữ hai panel hiện tại. Nút “Gửi nhận dạng”; capabilities hiển thị nhận dạng bởi Google hoặc máy chủ local. Consent cloud riêng: Google nhận audio; free tier có thể dùng dữ liệu cải thiện sản phẩm. Không hứa dữ liệu chỉ ở server khi dùng cloud. Nếu provider/consentVersion đổi, effective consent false, cần tích lại; gửi snapshot provider. Free tier/quota lỗi giữ audio trên thiết bị, không tự bật paid provider. Không hiện điểm pronunciation.

Audit correction: khi chờ quyền microphone, khóa thao tác mở mic/gửi/import lần nữa và hiện loading; chỉ cho1 acquisition đang chờ. Khi unmount, stream trả về trễ phải dừng, lỗi permission không set state sau unmount. Physical mic permission/hardware vẫn cần người dùng kiểm.

## 2026-10-31 — Worker boundary dùng chung

`apps/worker/src/speech.processor.ts` dùng `installProcessErrorHandlers`, guarded startup/timer recovery, structured worker error và shutdown có catch/deadline15s. Không đổi UI/consent/provider/ASR semantics. [Contract](../../shared/error-handling.md), [audit](../../audits/system-library-worker-errors.md).


## 2026-11-02 — Xác nhận UI dùng chung (#14)

[SpeechSession](../../../apps/web/app/speech/page.tsx): `remove`. Xóa audio/transcript có dialog Xóa bản ghi/Hủy; chỉ true mới tăng generation và gửi DELETE; busy/error/ownership không đổi.

[Hợp đồng component](../../shared/confirmation-ui.md) · [Audit tích hợp](../../audits/confirmation-ui-2026-11-02.md).
