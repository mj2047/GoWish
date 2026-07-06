import { NextResponse } from "next/server";
import { reconcileClaims } from "@/lib/claimLifecycle";

// Call this on a schedule in production (Vercel Cron hits this via GET, and
// automatically sends `Authorization: Bearer $CRON_SECRET` when that env var
// is set) so reminders/expiry/auto-release fire on time instead of only when
// a page happens to be viewed.
async function handle(request: Request) {
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

export const GET = handle;
export const POST = handle;
