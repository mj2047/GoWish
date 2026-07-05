import { NextResponse } from "next/server";
import { reconcileClaims } from "@/lib/claimLifecycle";

// Call this on a schedule in production (e.g. Vercel Cron every few minutes) so
// reminders/expiry/auto-release fire on time instead of only when a page happens
// to be viewed. Protect it with CRON_SECRET so it can't be triggered by anyone else.
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const header = request.headers.get("authorization");
    if (header !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  await reconcileClaims();
  return NextResponse.json({ ok: true });
}
