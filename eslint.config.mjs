import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  { settings: { next: { rootDir: "apps/web/" } } },
  { rules: { "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }] } },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "**/.next/**",
    "**/dist/**",
    ".local/**",
    "test-results/**",
    "playwright-report/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "**/next-env.d.ts",
  ]),
]);

export default eslintConfig;
