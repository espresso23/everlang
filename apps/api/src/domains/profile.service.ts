import {
  ormDataSource,
  createQueryRunner,
  rollback,
} from "@everlang/backend/orm";
import { Entities } from "@everlang/backend/entities";

import { profileInput } from "@everlang/contracts/profile";
import { Injectable } from "@nestjs/common";
import type { Request } from "express";

import type { Viewer } from "@everlang/backend/http";
@Injectable()
export class ProfileService {
  async get(_: Request, u: Viewer) {
    await ormDataSource
      .createQueryBuilder()
      .insert()
      .into(Entities.profiles, ["user_id"])
      .values({ user_id: () => ":p1" })
      .updateEntity(false)
      .orIgnore()
      .setParameters({ p1: u.id })
      .execute()
      .then((result) => result.raw);
    return {
      profile: (
        await ormDataSource
          .createQueryBuilder()
          .select(["*"])
          .from(Entities.profiles, "row")
          .where("user_id=:p1")
          .setParameters({ p1: u.id })
          .getRawMany()
      )[0],
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image ?? null,
        emailVerified: u.emailVerified,
        admin: u.admin,
      },
      providers: (
        await ormDataSource
          .createQueryBuilder()
          .select(["provider_id"])
          .from(Entities.auth_identities, "row")
          .distinct(true)
          .where("user_id=:p1")
          .setParameters({ p1: u.id })
          .getRawMany()
      ).map((row) => row.provider_id),
      googleEnabled: Boolean(
        process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
      ),
    };
  }
  async put(r: Request, u: Viewer) {
    const b = profileInput.parse(r.body);
    const connection = await createQueryRunner();
    try {
      await connection.startTransaction();
      await connection.manager
        .createQueryBuilder()
        .update(Entities.users)
        .set({ name: () => ":p2", updated_at: () => "now()" })
        .where("id=:p1")
        .setParameters({ p1: u.id, p2: b.name })
        .execute()
        .then((result) => result.raw);
      await connection.manager
        .createQueryBuilder()
        .insert()
        .into(Entities.profiles, [
          "user_id",
          "level",
          "goal",
          "minutes",
          "timezone",
        ])
        .values({
          user_id: () => ":p1",
          level: () => ":p2",
          goal: () => ":p3",
          minutes: () => ":p4",
          timezone: () => ":p5",
        })
        .updateEntity(false)
        .orUpdate(["level", "goal", "minutes", "timezone"], ["user_id"])
        .setParameters({
          p1: u.id,
          p2: b.level,
          p3: b.goal,
          p4: b.minutes,
          p5: b.timezone,
        })
        .execute()
        .then((result) => result.raw);
      await connection.commitTransaction();
    } catch (error) {
      await rollback(connection);
      throw error;
    } finally {
      await connection.release();
    }
    return { saved: true };
  }
}
