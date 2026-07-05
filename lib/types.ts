export const ITEM_STATUSES = ["available", "claimed", "expiring", "given"] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

export const CLAIM_STATUSES = [
  "active",
  "expiring",
  "released",
  "cancelled",
  "completed",
] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export const NOTIFICATION_TYPES = [
  "item_claimed",
  "claim_reminder",
  "claim_expiring",
  "item_deleted",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
