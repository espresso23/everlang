import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { nextCookies } from "better-auth/next-js";
import nodemailer from "nodemailer";
import { db } from "./sql";
import * as schema from "./sql/schema";

export const isAdmin = (email: string) =>
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .includes(email.toLowerCase());
async function sendMail(to: string, subject: string, url: string) {
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "mailpit",
    port: Number(process.env.SMTP_PORT || 1025),
    secure: process.env.SMTP_SECURE === "true",
    ...(process.env.SMTP_USER
      ? {
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        }
      : {}),
  });
  await transport.sendMail({
    from: process.env.MAIL_FROM || "EverLang <hello@everlang.local>",
    to,
    subject,
    text: `${subject}\n\n${url}\n\nNếu không yêu cầu, bạn có thể bỏ qua email này.`,
  });
}
function createAuth() {
  if (!process.env.BETTER_AUTH_SECRET)
    throw new Error("BETTER_AUTH_SECRET chưa được cấu hình.");
  return betterAuth({
    appName: "EverLang",
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    database: drizzleAdapter(db, { provider: "pg", schema }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 10,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) =>
        sendMail(user.email, "Đặt lại mật khẩu EverLang", url),
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) =>
        sendMail(user.email, "Xác minh email EverLang", url),
    },
    socialProviders:
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? {
            google: {
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            },
          }
        : {},
    account: {
      accountLinking: { enabled: true, disableImplicitLinking: true },
    },
    rateLimit: { enabled: true, window: 60, max: 30 },
    plugins: [nextCookies()],
  });
}
let instance: ReturnType<typeof createAuth> | undefined;
export function getAuth() {
  return (instance ??= createAuth());
}
