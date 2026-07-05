"use client";

import { useLanguage } from "@/components/LanguageProvider";

export function ListPageHeader() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-display text-3xl font-black tracking-tight">
        {t("list.yourWishlist")}
      </h1>
      <p className="text-muted-foreground">{t("list.description")}</p>
    </div>
  );
}
