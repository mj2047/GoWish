import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function resolveFollowee(username: string) {
  return prisma.user.findUnique({ where: { username } });
}

export async function POST(_request: Request, { params }: { params: Promise<{ username: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username } = await params;
  const followee = await resolveFollowee(username);
  if (!followee) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (followee.id === session.user.id) {
    return NextResponse.json({ error: "You can't follow yourself" }, { status: 400 });
  }

  await prisma.follow.upsert({
    where: {
      followerId_followeeId: { followerId: session.user.id, followeeId: followee.id },
    },
    create: { followerId: session.user.id, followeeId: followee.id },
    update: {},
  });

  return NextResponse.json({ following: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ username: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username } = await params;
  const followee = await resolveFollowee(username);
  if (!followee) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.follow.deleteMany({
    where: { followerId: session.user.id, followeeId: followee.id },
  });

  return NextResponse.json({ following: false });
}
