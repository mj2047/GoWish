"use client";

import { Gift } from "lucide-react";
import { ItemClaimControl } from "@/components/ItemClaimControl";
import { PublicClaimPrompt } from "@/components/PublicClaimPrompt";
import { useLanguage } from "@/components/LanguageProvider";
import type { ItemStatus } from "@/lib/types";

export type GridItem = {
  id: string;
  title: string;
  imageUrl: string | null;
  price: number | null;
  status: ItemStatus;
  ownClaim: { plannedGiveDate: string | null; expiringStartedAt: string | null } | null;
};

function GiftPlaceholder() {
  return (
    <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-brand/20">
      <Gift className="h-10 w-10 text-muted-foreground" />
    </div>
  );
}

export function ItemGrid({
  items,
  ownerName,
  interactive,
}: {
  items: GridItem[];
  ownerName: string;
  interactive: boolean;
}) {
  const { t } = useLanguage();

  if (items.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        {t("public.emptyList", { name: ownerName })}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.id} className="glass card-hover group overflow-hidden rounded-3xl">
          <div className="relative aspect-[4/3] overflow-hidden">
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt=""
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <GiftPlaceholder />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {item.price != null && (
              <div className="absolute bottom-3 right-3 rounded-full bg-black/40 px-2.5 py-1 text-sm font-bold text-white backdrop-blur">
                ${item.price.toFixed(2)}
              </div>
            )}
          </div>

          <div className="space-y-3 p-4">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{item.title}</h3>
            {interactive ? (
              <ItemClaimControl
                itemId={item.id}
                initialStatus={item.status}
                initialIsOwnClaim={!!item.ownClaim}
                initialPlannedGiveDate={item.ownClaim?.plannedGiveDate ?? null}
                initialExpiringStartedAt={item.ownClaim?.expiringStartedAt ?? null}
              />
            ) : (
              <PublicClaimPrompt status={item.status} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
