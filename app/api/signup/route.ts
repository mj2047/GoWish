import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateUniquePublicShareSlug } from "@/lib/slug";
import { generateUniqueUsername } from "@/lib/username";

const signupSchema = z.object({
  identifier: z.string().min(3).max(255),
  password: z.string().min(8).max(200),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { identifier, password } = parsed.data;

  const isEmail = identifier.includes("@");
  let email: string | undefined;
  let phone: string | undefined;

  if (isEmail) {
    const emailResult = z.string().email().safeParse(identifier);
    if (!emailResult.success) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    email = identifier;
  } else {
    if (identifier.replace(/\D/g, "").length < 7) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }
    phone = identifier;
  }

  const existing = await prisma.user.findFirst({
    where: {
      OR: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
    },
  });
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email or phone already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const username = await generateUniqueUsername(isEmail ? identifier.split("@")[0] : phone!);
  const publicShareSlug = await generateUniquePublicShareSlug(username);

  const user = await prisma.user.create({
    data: {
      name: username,
      username,
      email,
      phone,
      passwordHash,
      publicShareSlug,
    },
  });

  return NextResponse.json({ id: user.id, username: user.username });
}
