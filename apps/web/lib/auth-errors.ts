/** Never reflect arbitrary OAuth query values in UI or logs. */
export function authErrorMessage(code: string | null) {
  if (!code) return "";
  if (code === "account_not_linked")
    return "Email này đã có tài khoản. Hãy đăng nhập bằng phương thức cũ rồi liên kết Google trong hồ sơ.";
  if (["INVALID_TOKEN", "invalid_token", "token_expired"].includes(code))
    return "Liên kết xác thực đã hết hạn hoặc không hợp lệ. Hãy yêu cầu email mới.";
  if (["invalid_client", "invalid_code", "access_denied", "state_mismatch", "unable_to_get_user_info"].includes(code))
    return "Đăng nhập Google chưa hoàn tất. Hãy thử lại; nếu vẫn lỗi, kiểm tra cấu hình OAuth.";
  return "Yêu cầu xác thực chưa hoàn tất. Hãy thử lại.";
}
