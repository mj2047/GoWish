"use client";

import Link from "next/link";
import { useState } from "react";
import { Share2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export function ShareLinkBar({ slug }: { slug: string }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const path = `/u/${slug}`;

  async function handleCopy() {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — user can still select the text manually
    }
  }

  return (
    <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand text-white">
          <Share2 className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium">{t("list.shareLink")}</p>
          <Link href={path} className="text-sm text-muted-foreground underline underline-offset-2">
            {path}
          </Link>
        </div>
      </div>
      <button
        onClick={handleCopy}
        className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-foreground/80 transition hover:bg-white/5"
      >
        {copied ? t("list.copied") : t("list.copyLink")}
      </button>
    </div>
  );
}
