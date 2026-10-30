import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const GET = () =>
  NextResponse.json({
    google: Boolean(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
    ),
  }, { headers: { "Cache-Control": "no-store" } });
