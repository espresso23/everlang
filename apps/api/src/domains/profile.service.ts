import { pool, query } from "@everlang/backend/sql";
import { profileInput } from "@everlang/contracts/profile";
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';

import type { Viewer } from '@everlang/backend/http';
@Injectable()
export class ProfileService {
async get(_: Request, u: Viewer) {
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
    providers: (await query("SELECT DISTINCT provider_id FROM auth_identities WHERE user_id=$1", [u.id]))
      .map(row => row.provider_id),
    googleEnabled: Boolean(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
    ),
  };

}
async put(r: Request, u: Viewer) {
  const b = profileInput.parse(r.body);
  const connection = await pool.connect();
  try {
    await connection.query("BEGIN");
    await connection.query("UPDATE users SET name=$2,updated_at=now() WHERE id=$1", [u.id, b.name]);
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

}
}
