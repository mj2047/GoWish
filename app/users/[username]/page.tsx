import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { reconcileClaims } from "@/lib/claimLifecycle";
import { FollowButton } from "@/components/FollowButton";
import { ItemGrid, type GridItem } from "@/components/ItemGrid";
import type { ItemStatus } from "@/lib/types";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { username } = await params;
  if (username === session.user.username) {
    redirect("/list");
  }

  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) {
    notFound();
  }

  await reconcileClaims();

  const [existingFollow, items] = await Promise.all([
    prisma.follow.findUnique({
      where: {
        followerId_followeeId: { followerId: session.user.id, followeeId: target.id },
      },
    }),
    prisma.wishlistItem.findMany({
      where: { ownerId: target.id },
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
    const ownClaim = item.claims.find((c) => c.claimerId === session.user.id);
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
      <div className="flex flex-col items-center gap-4 text-center">
        {target.profilePhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={target.profilePhotoUrl}
            alt=""
            className="h-20 w-20 rounded-full object-cover ring-2 ring-white/10"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-brand text-2xl font-black text-white ring-2 ring-white/10">
            {target.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="font-display text-xl font-bold">{target.name}</h1>
          <p className="text-muted-foreground">@{target.username}</p>
        </div>
        <FollowButton username={target.username} initialFollowing={!!existingFollow} />
      </div>

      <ItemGrid items={gridItems} interactive ownerName={target.name} />
    </main>
  );
}
