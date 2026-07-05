import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { reconcileClaims } from "@/lib/claimLifecycle";

const claimSchema = z.object({
  plannedGiveDate: z.string().datetime().optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const parsed = claimSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid planned give date" }, { status: 400 });
  }
  const plannedGiveDate = parsed.data.plannedGiveDate ? new Date(parsed.data.plannedGiveDate) : null;

  await reconcileClaims();

  const item = await prisma.wishlistItem.findUnique({ where: { id } });
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (item.ownerId === session.user.id) {
    return NextResponse.json({ error: "You can't claim your own item" }, { status: 400 });
  }

  const claimed = await prisma.$transaction(async (tx) => {
    const updated = await tx.wishlistItem.updateMany({
      where: { id, status: "available" },
      data: { status: "claimed" },
    });
    if (updated.count === 0) return false;

    const claim = await tx.claim.create({
      data: { itemId: id, claimerId: session.user.id, status: "active", plannedGiveDate },
    });

    // Owner is notified that something was claimed — never who, never which item.
    await tx.notification.create({
      data: {
        userId: item.ownerId,
        type: "item_claimed",
        message: "notif.itemClaimed",
        relatedItemId: id,
        relatedClaimId: claim.id,
      },
    });

    return true;
  });

  if (!claimed) {
    return NextResponse.json({ error: "Item is no longer available" }, { status: 409 });
  }

  return NextResponse.json({ status: "claimed" });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const parsed = claimSchema.safeParse(body);
  if (!parsed.success || !parsed.data.plannedGiveDate) {
    return NextResponse.json({ error: "A planned give date is required" }, { status: 400 });
  }

  await reconcileClaims({ claimerId: session.user.id });

  const claim = await prisma.claim.findFirst({
    where: { itemId: id, claimerId: session.user.id, status: { in: ["active", "expiring"] } },
  });
  if (!claim) {
    return NextResponse.json({ error: "You haven't claimed this item" }, { status: 404 });
  }

  // Acting during the countdown exits `expiring` back to `claimed` with the fresh date.
  await prisma.$transaction([
    prisma.claim.update({
      where: { id: claim.id },
      data: {
        plannedGiveDate: new Date(parsed.data.plannedGiveDate),
        status: "active",
        reminderStage: 0,
        expiringStartedAt: null,
      },
    }),
    prisma.wishlistItem.update({ where: { id }, data: { status: "claimed" } }),
  ]);

  return NextResponse.json({ status: "claimed" });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  await prisma.$transaction([
    prisma.claim.update({ where: { id: claim.id }, data: { status: "released" } }),
    prisma.wishlistItem.update({ where: { id }, data: { status: "available" } }),
  ]);

  return NextResponse.json({ status: "available" });
}
