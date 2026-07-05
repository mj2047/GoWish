// Claim lifecycle timing — override via env vars, never hardcode call sites.
// See build brief: reminders fire daily starting CLAIM_LEAD_DAYS before the
// planned give date, then the claim goes `expiring` for CLAIM_EXPIRING_COUNTDOWN_HOURS
// before auto-releasing.

export const CLAIM_LEAD_DAYS = Number(process.env.CLAIM_LEAD_DAYS ?? 6);
export const CLAIM_REMINDER_SPACING_DAYS = Number(process.env.CLAIM_REMINDER_SPACING_DAYS ?? 1);
export const CLAIM_REMINDER_COUNT = Number(process.env.CLAIM_REMINDER_COUNT ?? 3);
export const CLAIM_EXPIRING_COUNTDOWN_HOURS = Number(
  process.env.CLAIM_EXPIRING_COUNTDOWN_HOURS ?? 12
);
