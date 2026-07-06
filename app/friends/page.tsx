import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { FriendsLists, type FriendUser } from "./FriendsLists";

export default async function FriendsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const [followerRows, followingRows] = await Promise.all([
    prisma.follow.findMany({
      where: { followeeId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { follower: { select: { username: true, name: true, profilePhotoUrl: true } } },
    }),
    prisma.follow.findMany({
      where: { followerId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { followee: { select: { username: true, name: true, profilePhotoUrl: true } } },
    }),
  ]);

  const followers: FriendUser[] = followerRows.map((f) => f.follower);
  const following: FriendUser[] = followingRows.map((f) => f.followee);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <FriendsLists followers={followers} following={following} />
    </main>
  );
}
