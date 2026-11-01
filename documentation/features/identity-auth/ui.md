# UI — identity-auth

Giữ wireframe Editorial. [Sign-in](../../../apps/web/app/sign-in/page.tsx): login/signup/forgot/reset password/Google; pending không hiện guest giả, lỗi mạng có retry, thông báo tiếng Việt không phản chiếu raw query. [Profile](../../../apps/web/app/profile/page.tsx): explicit Google linking, password credential-only, avatar và edit flow giữ nguyên.

[AuthProvider/useAuth/apiFetch](../../../apps/web/lib/auth.tsx) giữ access token RAM, bootstrap refresh trước dữ liệu riêng tư; refetch /me sau edit; logout BroadcastChannel. Hết access token refresh và retry một lần; revoked session về signed-out. Refresh cookie HttpOnly không được JS đọc.

Audio riêng tư dùng [PrivateAudio](../../../apps/web/components/private-audio.tsx) fetch Bearer→blob; abort/revoke khi unmount/logout, trạng thái loading/error. Sample speech playback/time bar giữ nguyên, không yêu cầu JWT riêng. Evidence: profile-ui/sample-audio/grading-retry Playwright; Google live cần owner xác nhận sau cutover.
