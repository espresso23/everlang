# UI hiện thực — 2026-11-01

Giữ toàn bộ Editorial layout và feature UX. Thay client auth cũ bằng AuthProvider JWT trong RAM; boot refresh/loading/error không giả guest, giữ draft khi mất phiên; explicit login sau cutover. Google/login/verify/reset/profile/security controls giữ behavior. Audio private dùng authorized blob URL thay cookie src. API errors có requestId để trace; không hiển thị stack/token.
