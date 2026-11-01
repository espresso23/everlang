import { expect, it } from "vitest";
import { validateRuntimeEnvironment } from "../../apps/api/src/runtime-config";
const configured = {
  DATABASE_URL: "postgresql://localhost/example",
  REDIS_URL: "redis://localhost:6379",
  JWT_PRIVATE_KEY_B64: "test-fixture",
  JWT_PUBLIC_KEY_B64: "test-fixture",
  CSRF_SECRET: "test-fixture",
};
it("boots the PostgreSQL-only configuration without any Mongo environment variable", () => {
  expect(validateRuntimeEnvironment(configured)).toEqual(configured);
});
it("still rejects a missing primary database and invalid public origin", () => {
  expect(() => validateRuntimeEnvironment({ ...configured, DATABASE_URL: undefined })).toThrow("DATABASE_URL must be configured");
  expect(() => validateRuntimeEnvironment({ ...configured, PUBLIC_ORIGIN: "invalid" })).toThrow();
});
