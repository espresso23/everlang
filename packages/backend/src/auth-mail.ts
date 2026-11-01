import nodemailer from "nodemailer";
import { HttpError } from "./http";
export async function sendAuthEmail(to: string, subject: string, url: string) {
    const host = process.env.SMTP_HOST?.trim();
    if (!host)
        throw new HttpError(503, "Dịch vụ email chưa được cấu hình. Liên hệ quản trị viên.", "EMAIL_UNAVAILABLE");
    try {
        await nodemailer.createTransport({
            host,
            port: Number(process.env.SMTP_PORT || 587),
            secure: process.env.SMTP_SECURE === "true",
            connectionTimeout: 5000,
            socketTimeout: 10000,
            ...(process.env.SMTP_USER ? { auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } } : {}),
        }).sendMail({
            from: process.env.MAIL_FROM || "EverLang <hello@everlang.local>", to, subject,
            text: `${subject}\n\n${url}\n\nNếu không yêu cầu, bạn có thể bỏ qua email này.`,
        });
    }
    catch {
        throw new HttpError(503, "Chưa gửi được email. Vui lòng thử lại sau.", "EMAIL_UNAVAILABLE");
    }
}
