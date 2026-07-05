import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { reconcileClaims } from "@/lib/claimLifecycle";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  await reconcileClaims({ claimerId: session.user.id });

  const claim = await prisma.claim.findFirst({
    where: { itemId: id, claimerId: session.user.id, status: { in: ["active", "expiring"] } },
  });
  if (!claim) {
    return NextResponse.json({ error: "You haven't claimed this item" }, { status: 404 });
  }

  // Permanent — a given item never returns to available.
  await prisma.$transaction([
    prisma.claim.update({ where: { id: claim.id }, data: { status: "completed" } }),
    prisma.wishlistItem.update({ where: { id }, data: { status: "given" } }),
  ]);

  return NextResponse.json({ status: "given" });
}
