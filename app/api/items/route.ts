import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  imageUrl: z.string().url().optional().or(z.literal("")),
  price: z.number().nonnegative().optional(),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  addedManually: z.boolean().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { title, imageUrl, price, sourceUrl, addedManually } = parsed.data;

  const item = await prisma.wishlistItem.create({
    data: {
      ownerId: session.user.id,
      title,
      imageUrl: imageUrl || null,
      price: price ?? null,
      sourceUrl: sourceUrl || null,
      addedManually: addedManually ?? true,
      status: "available",
    },
  });

  return NextResponse.json(item, { status: 201 });
}
