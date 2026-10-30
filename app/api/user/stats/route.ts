import { api } from "@/lib/api";
import { statistics } from "@/lib/learning/submissions";
export const GET = api("/api/user/stats", async (_, u) => statistics(u.id));
