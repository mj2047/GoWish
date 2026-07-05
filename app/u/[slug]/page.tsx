import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { reconcileClaims } from "@/lib/claimLifecycle";
import { ItemGrid, type GridItem } from "@/components/ItemGrid";
import { PublicPageHeader } from "./PublicPageHeader";
import type { ItemStatus } from "@/lib/types";

export default async function PublicSharePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const owner = await prisma.user.findUnique({ where: { publicShareSlug: slug } });
  if (!owner) {
    notFound();
  }

  const session = await auth();
  if (session?.user?.id === owner.id) {
    redirect("/list");
  }

  await reconcileClaims();

  const [existingFollow, items] = await Promise.all([
    session?.user
      ? prisma.follow.findUnique({
          where: {
            followerId_followeeId: { followerId: session.user.id, followeeId: owner.id },
          },
        })
      : null,
    prisma.wishlistItem.findMany({
      where: { ownerId: owner.id },
      orderBy: { createdAt: "desc" },
      include: {
        claims: {
          where: { status: { in: ["active", "expiring"] } },
          select: { claimerId: true, plannedGiveDate: true, expiringStartedAt: true },
        },
      },
    }),
  ]);

  const gridItems: GridItem[] = items.map((item) => {
    const ownClaim = session?.user
      ? item.claims.find((c) => c.claimerId === session.user.id)
      : undefined;
    return {
      id: item.id,
      title: item.title,
      imageUrl: item.imageUrl,
      price: item.price,
      status: item.status as ItemStatus,
      ownClaim: ownClaim
        ? {
            plannedGiveDate: ownClaim.plannedGiveDate?.toISOString() ?? null,
            expiringStartedAt: ownClaim.expiringStartedAt?.toISOString() ?? null,
          }
        : null,
    };
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <PublicPageHeader
        isGuest={!session?.user}
        ownerName={owner.name}
        ownerUsername={owner.username}
        ownerPhotoUrl={owner.profilePhotoUrl}
        initialFollowing={!!existingFollow}
      />

      <ItemGrid items={gridItems} interactive={!!session?.user} ownerName={owner.name} />
    </main>
  );
}
