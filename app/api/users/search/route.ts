import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const users = await prisma.user.findMany({
    where: {
      id: { not: session.user.id },
      OR: [{ username: { contains: q } }, { name: { contains: q } }],
    },
    select: { username: true, name: true, profilePhotoUrl: true },
    take: 6,
  });

  return NextResponse.json(users);
}
