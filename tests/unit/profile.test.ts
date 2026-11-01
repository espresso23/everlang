import { describe, expect, it } from "vitest";
import { profileInput } from "@everlang/contracts/profile";
import { authErrorMessage } from "@/lib/auth-errors";

const valid = { name: "  Người học  ", level: "Trung cấp", goal: "Học mỗi ngày", minutes: 25, timezone: "Asia/Ho_Chi_Minh" };
describe("profile contract", () => {
  it("normalizes names and accepts a real IANA zone", () => {
    expect(profileInput.parse(valid).name).toBe("Người học");
  });
  it.each([
    { name: " " }, { minutes: 4 }, { minutes: 121 }, { minutes: 20.5 },
    { timezone: "not-a-zone" }, { level: "TOPIK 7" }, { goal: "" },
    { admin: true }, { user_id: "another-user" }, { email: "other@example.test" },
  ])("rejects invalid data and identity/role injection: %j", delta => {
    expect(profileInput.safeParse({ ...valid, ...delta }).success).toBe(false);
  });
});

describe("auth callback errors", () => {
  it("distinguishes email link expiry from a Google failure", () => {
    expect(authErrorMessage("INVALID_TOKEN")).toContain("Liên kết xác thực");
    expect(authErrorMessage("invalid_code")).toContain("Google");
    expect(authErrorMessage("account_not_linked")).toContain("phương thức cũ");
  });
  it("does not reflect untrusted query strings", () => {
    expect(authErrorMessage("sensitive-query")).not.toContain("sensitive-query");
    expect(authErrorMessage(null)).toBe("");
  });
});
