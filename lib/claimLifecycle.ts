import { prisma } from "@/lib/prisma";
import {
  CLAIM_LEAD_DAYS,
  CLAIM_REMINDER_SPACING_DAYS,
  CLAIM_REMINDER_COUNT,
  CLAIM_EXPIRING_COUNTDOWN_HOURS,
} from "@/lib/claimConfig";

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

// stageIndex 0 -> T-6, 1 -> T-5, 2 -> T-4 (with the default constants)
function reminderThreshold(plannedGiveDate: Date, stageIndex: number): Date {
  const daysBefore = CLAIM_LEAD_DAYS - stageIndex * CLAIM_REMINDER_SPACING_DAYS;
  return new Date(plannedGiveDate.getTime() - daysBefore * DAY_MS);
}

const REMINDER_MESSAGES = ["notif.reminder1", "notif.reminder2", "notif.reminder3"];

/**
 * Advances claim state based on elapsed time relative to each claim's planned
 * give date: fires the T-6/T-5/T-4 day reminders, flips unresponsive claims to
 * `expiring` at T-4 (starting the auto-release countdown), and auto-releases
 * `expiring` claims once the countdown elapses.
 *
 * There's no persistent background worker in this app, so this is called
 * opportunistically wherever claim/item state is read or acted on (list pages,
 * the notifications endpoint, claim actions) — plus it's exposed via
 * /api/cron/reconcile-claims for a real scheduler (e.g. Vercel Cron) in
 * production, where relying on incidental page views wouldn't be reliable.
 */
export async function reconcileClaims(where: { claimerId?: string } = {}) {
  const now = new Date();
  const claims = await prisma.claim.findMany({
    where: {
      status: { in: ["active", "expiring"] },
      plannedGiveDate: { not: null },
      ...where,
    },
  });

  for (const claim of claims) {
    if (!claim.plannedGiveDate || !claim.itemId) continue;

    if (claim.status === "active") {
      let stage = claim.reminderStage;
      const newMessages: string[] = [];
      while (
        stage < CLAIM_REMINDER_COUNT &&
        now >= reminderThreshold(claim.plannedGiveDate, stage)
      ) {
        newMessages.push(REMINDER_MESSAGES[stage]);
        stage += 1;
      }

      if (stage >= CLAIM_REMINDER_COUNT && claim.reminderStage < CLAIM_REMINDER_COUNT) {
        // Crossed the final (T-4) reminder threshold with no response — expire now.
        await prisma.$transaction([
          prisma.claim.update({
            where: { id: claim.id },
            data: { reminderStage: stage, status: "expiring", expiringStartedAt: now },
          }),
          prisma.wishlistItem.update({
            where: { id: claim.itemId },
            data: { status: "expiring" },
          }),
          ...newMessages.map((message) =>
            prisma.notification.create({
              data: {
                userId: claim.claimerId,
                type: "claim_reminder",
                message,
                relatedItemId: claim.itemId,
                relatedClaimId: claim.id,
              },
            })
          ),
          prisma.notification.create({
            data: {
              userId: claim.claimerId,
              type: "claim_expiring",
              message: "notif.expiring",
              relatedItemId: claim.itemId,
              relatedClaimId: claim.id,
            },
          }),
        ]);
      } else if (stage > claim.reminderStage) {
        await prisma.$transaction([
          prisma.claim.update({ where: { id: claim.id }, data: { reminderStage: stage } }),
          ...newMessages.map((message) =>
            prisma.notification.create({
              data: {
                userId: claim.claimerId,
                type: "claim_reminder",
                message,
                relatedItemId: claim.itemId,
                relatedClaimId: claim.id,
              },
            })
          ),
        ]);
      }
    } else if (claim.status === "expiring" && claim.expiringStartedAt) {
      const releaseAt = claim.expiringStartedAt.getTime() + CLAIM_EXPIRING_COUNTDOWN_HOURS * HOUR_MS;
      if (now.getTime() >= releaseAt) {
        await prisma.$transaction([
          prisma.claim.update({ where: { id: claim.id }, data: { status: "released" } }),
          prisma.wishlistItem.update({ where: { id: claim.itemId }, data: { status: "available" } }),
        ]);
      }
    }
  }
}
