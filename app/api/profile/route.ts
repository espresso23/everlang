import { z } from "zod";
import { api } from "@/lib/api";
import { query } from "@/lib/sql";
import { getAuth } from "@/lib/auth";
export const GET = api("/api/profile", async (_, u) => {
  await query(
    "INSERT INTO profiles(user_id) VALUES($1) ON CONFLICT DO NOTHING",
    [u.id],
  );
  return {
    profile: (
      await query("SELECT * FROM profiles WHERE user_id=$1", [u.id])
    )[0],
    user: u,
    googleEnabled: Boolean(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
    ),
  };
});
export const PUT = api("/api/profile", async (r, u) => {
  const b = z
    .object({
      name: z.string().trim().min(1).max(80),
      level: z.enum(["Trung cấp", "Cao cấp"]),
      goal: z.string().trim().min(1).max(300),
      minutes: z.number().int().min(5).max(120),
      timezone: z.string().refine((v) => {
        try {
          new Intl.DateTimeFormat("en", { timeZone: v });
          return true;
        } catch {
          return false;
        }
      }),
    })
    .parse(await r.json());
  await getAuth().api.updateUser({
    headers: r.headers,
    body: { name: b.name },
  });
  await query(
    "INSERT INTO profiles(user_id,level,goal,minutes,timezone) VALUES($1,$2,$3,$4,$5) ON CONFLICT(user_id) DO UPDATE SET level=$2,goal=$3,minutes=$4,timezone=$5",
    [u.id, b.level, b.goal, b.minutes, b.timezone],
  );
  return { saved: true };
});
