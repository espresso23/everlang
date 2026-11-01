export function validateRuntimeEnvironment(env: Record<string, string | undefined>) {
  for (const name of ["DATABASE_URL", "REDIS_URL", "JWT_PRIVATE_KEY_B64", "JWT_PUBLIC_KEY_B64", "CSRF_SECRET"])
    if (!env[name]) throw new Error(name + " must be configured");
  new URL(env.PUBLIC_ORIGIN || "http://localhost:3000");
  return env;
}
