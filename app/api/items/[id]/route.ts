import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  price: z.number().nonnegative().nullable().optional(),
  sourceUrl: z.string().url().optional().or(z.literal("")),
});

async function requireOwnedItem(itemId: string, userId: string) {
  const item = await prisma.wishlistItem.findUnique({ where: { id: itemId } });
  if (!item || item.ownerId !== userId) return null;
  return item;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const item = await requireOwnedItem(id, session.user.id);
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { title, imageUrl, price, sourceUrl } = parsed.data;

  const updated = await prisma.wishlistItem.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(imageUrl !== undefined ? { imageUrl: imageUrl || null } : {}),
      ...(price !== undefined ? { price } : {}),
      ...(sourceUrl !== undefined ? { sourceUrl: sourceUrl || null } : {}),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const item = await requireOwnedItem(id, session.user.id);
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Owner is never blocked by claim status — deletion always proceeds even if
  // an active claim exists (the owner can't see claim status anyway). The
  // claim is marked `cancelled` (distinct from a voluntary `released`) and the
  // claimer is notified, since this wasn't their choice.
  const activeClaims = await prisma.claim.findMany({
    where: { itemId: id, status: { in: ["active", "expiring"] } },
  });

  await prisma.$transaction([
    ...activeClaims.map((claim) =>
      prisma.claim.update({ where: { id: claim.id }, data: { status: "cancelled" } })
    ),
    ...activeClaims.map((claim) =>
      prisma.notification.create({
        data: {
          userId: claim.claimerId,
          type: "item_deleted",
          message: "notif.itemDeleted",
          relatedClaimId: claim.id,
        },
      })
    ),
    prisma.wishlistItem.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true });
}
