import { afterEach, beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ send: vi.fn(), transport: vi.fn() }));
vi.mock("nodemailer", () => ({ default: { createTransport: state.transport } }));
import { sendAuthEmail } from "@everlang/backend/auth-mail";
beforeEach(() => { vi.clearAllMocks(); state.transport.mockReturnValue({ sendMail: state.send }); state.send.mockResolvedValue({}); });
afterEach(() => vi.unstubAllEnvs());
it("requires configured SMTP without silently using removed Mailpit", async () => {
    vi.stubEnv("SMTP_HOST", "");
    await expect(sendAuthEmail("qa@example.test", "Verify", "https://example.test/token")).rejects.toMatchObject({ status: 503, code: "EMAIL_UNAVAILABLE" });
    expect(state.transport).not.toHaveBeenCalled();
});
it("uses explicit SMTP and normalizes transport failure without leaking provider details", async () => {
    vi.stubEnv("SMTP_HOST", "smtp.example.test");
    vi.stubEnv("SMTP_PORT", "");
    state.send.mockRejectedValue(new Error("private credential in provider response"));
    await expect(sendAuthEmail("qa@example.test", "Verify", "https://example.test/token")).rejects.toMatchObject({ status: 503, code: "EMAIL_UNAVAILABLE", message: "Chưa gửi được email. Vui lòng thử lại sau." });
    expect(state.transport).toHaveBeenCalledWith(expect.objectContaining({ host: "smtp.example.test", port: 587 }));
});
