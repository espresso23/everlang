import { api } from "@/lib/api";
import { pool, query } from "@/lib/sql";
import { profileInput } from "@/lib/profile";
export const GET = api("/api/profile", async (_, u) => {
  await query(
    "INSERT INTO profiles(user_id) VALUES($1) ON CONFLICT DO NOTHING",
    [u.id],
  );
  return {
    profile: (
      await query("SELECT * FROM profiles WHERE user_id=$1", [u.id])
    )[0],
    user: {
      id: u.id, name: u.name, email: u.email, image: u.image ?? null,
      emailVerified: u.emailVerified, admin: u.admin,
    },
    providers: (await query("SELECT DISTINCT provider_id FROM auth_account WHERE user_id=$1", [u.id]))
      .map(row => row.provider_id),
    googleEnabled: Boolean(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
    ),
  };
});
export const PUT = api("/api/profile", async (r, u) => {
  const b = profileInput.parse(await r.json());
  const connection = await pool.connect();
  try {
    await connection.query("BEGIN");
    await connection.query("UPDATE auth_user SET name=$2,updated_at=now() WHERE id=$1", [u.id, b.name]);
    await connection.query(
      "INSERT INTO profiles(user_id,level,goal,minutes,timezone) VALUES($1,$2,$3,$4,$5) ON CONFLICT(user_id) DO UPDATE SET level=$2,goal=$3,minutes=$4,timezone=$5",
      [u.id, b.level, b.goal, b.minutes, b.timezone],
    );
    await connection.query("COMMIT");
  } catch (error) {
    await connection.query("ROLLBACK");
    throw error;
  } finally { connection.release(); }
  return { saved: true };
});
