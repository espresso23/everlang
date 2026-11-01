import { z } from "zod";

export const profileInput = z.object({
  name: z.string().trim().min(1).max(80),
  level: z.enum(["Trung cấp", "Cao cấp"]),
  goal: z.string().trim().min(1).max(300),
  minutes: z.number().int().min(5).max(120),
  timezone: z.string().max(100).refine(value => {
    try { new Intl.DateTimeFormat("en", { timeZone: value }); return true; }
    catch { return false; }
  }),
}).strict();

export type ProfileResponse = {
  user: { id: string; name: string; email: string; image: string | null; emailVerified: boolean; admin: boolean };
  profile: { level: "Trung cấp" | "Cao cấp"; goal: string; minutes: number; timezone: string };
  providers: string[];
  googleEnabled: boolean;
};
