"use client";

import Link from "next/link";
import { ItemStatusBadge } from "@/components/ItemStatusBadge";
import { useLanguage } from "@/components/LanguageProvider";
import type { ItemStatus } from "@/lib/types";

export function PublicClaimPrompt({ status }: { status: ItemStatus }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-start gap-1.5">
      <ItemStatusBadge status={status} />
      {status === "available" && (
        <Link
          href="/signup"
          className="btn-gradient rounded-xl px-4 py-2 text-sm font-bold"
        >
          {t("claim.signUpToClaim")}
        </Link>
      )}
    </div>
  );
}
