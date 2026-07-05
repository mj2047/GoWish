"use client";

import { CheckCircle2, Clock, Gift, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import type { ItemStatus } from "@/lib/types";

const STYLES: Record<ItemStatus, string> = {
  available: "text-status-available bg-status-available/15 border-status-available/30",
  claimed: "text-status-claimed bg-status-claimed/15 border-status-claimed/30",
  expiring: "text-status-expiring bg-status-expiring/15 border-status-expiring/30",
  given: "text-status-given bg-status-given/15 border-status-given/30",
};

const ICONS: Record<ItemStatus, React.ReactNode> = {
  available: <Sparkles className="h-3 w-3" />,
  claimed: <Gift className="h-3 w-3" />,
  expiring: <Clock className="h-3 w-3" />,
  given: <CheckCircle2 className="h-3 w-3" />,
};

const LABEL_KEYS: Record<ItemStatus, string> = {
  available: "status.available",
  claimed: "status.claimed",
  expiring: "status.expiring",
  given: "status.given",
};

export function ItemStatusBadge({ status }: { status: ItemStatus }) {
  const { t } = useLanguage();
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${STYLES[status]}`}
    >
      {ICONS[status]}
      {t(LABEL_KEYS[status])}
    </span>
  );
}
