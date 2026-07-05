import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/)
    .optional(),
  profilePhotoUrl: z.string().url().optional().or(z.literal("")),
});

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, username, profilePhotoUrl } = parsed.data;

  if (username) {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json({ error: "Username is already taken" }, { status: 409 });
    }
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(username !== undefined ? { username } : {}),
      ...(profilePhotoUrl !== undefined ? { profilePhotoUrl: profilePhotoUrl || null } : {}),
    },
  });

  return NextResponse.json({
    name: user.name,
    username: user.username,
    profilePhotoUrl: user.profilePhotoUrl,
  });
}
