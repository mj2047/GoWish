import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function generateUniquePublicShareSlug(username: string): Promise<string> {
  const base = username.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (let attempt = 0; attempt < 5; attempt++) {
    const suffix = crypto.randomBytes(3).toString("hex");
    const candidate = `${base}-${suffix}`;
    const existing = await prisma.user.findUnique({ where: { publicShareSlug: candidate } });
    if (!existing) return candidate;
  }
  throw new Error("Could not generate a unique public share slug");
}
