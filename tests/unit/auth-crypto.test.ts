import {expect,it} from "vitest";
import {hashPassword,verifyPassword,randomToken,tokenHash} from "@everlang/backend/auth-crypto";
it("canonical scrypt preserves format and NFKC without old framework",async()=>{const hash=await hashPassword("Long-password-Ａ");expect(hash).toMatch(/^[a-f0-9]{32}:[a-f0-9]{128}$/);expect(await verifyPassword("Long-password-A",hash)).toBe(true);expect(await verifyPassword("wrong",hash)).toBe(false);expect(await verifyPassword("a","invalid")).toBe(false);});
it("refresh tokens are high-entropy opaque values and only stable hashes are persisted",()=>{const a=randomToken(),b=randomToken();expect(a).not.toBe(b);expect(a).toMatch(/^[a-zA-Z0-9_-]{43}$/);expect(tokenHash(a)).toHaveLength(64);expect(tokenHash(a)).not.toContain(a);});
