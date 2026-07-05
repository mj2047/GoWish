import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function generateUniqueUsername(base: string): Promise<string> {
  let cleaned = base.toLowerCase().replace(/[^a-z0-9_]/g, "");
  if (cleaned.length < 3) cleaned = `user${cleaned}`;
  cleaned = cleaned.slice(0, 20);

  const existing = await prisma.user.findUnique({ where: { username: cleaned } });
  if (!existing) return cleaned;

  for (let attempt = 0; attempt < 5; attempt++) {
    const suffix = crypto.randomBytes(2).toString("hex");
    const candidate = `${cleaned}_${suffix}`;
    const taken = await prisma.user.findUnique({ where: { username: candidate } });
    if (!taken) return candidate;
  }
  throw new Error("Could not generate a unique username");
}
