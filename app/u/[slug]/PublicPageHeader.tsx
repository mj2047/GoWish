"use client";

import Link from "next/link";
import { FollowButton } from "@/components/FollowButton";
import { useLanguage } from "@/components/LanguageProvider";

export function PublicPageHeader({
  isGuest,
  ownerName,
  ownerUsername,
  ownerPhotoUrl,
  initialFollowing,
}: {
  isGuest: boolean;
  ownerName: string;
  ownerUsername: string;
  ownerPhotoUrl: string | null;
  initialFollowing: boolean;
}) {
  const { t } = useLanguage();

  return (
    <>
      {isGuest && (
        <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3">
          <p className="text-sm text-muted-foreground">{t("public.guestBrowsing")}</p>
          <Link href="/signup" className="btn-gradient rounded-xl px-4 py-2 text-sm font-bold">
            {t("public.getTheApp")}
          </Link>
        </div>
      )}

      <div className="flex flex-col items-center gap-4 text-center">
        {ownerPhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ownerPhotoUrl}
            alt=""
            className="h-20 w-20 rounded-full object-cover ring-2 ring-white/10"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-brand text-2xl font-black text-white ring-2 ring-white/10">
            {ownerName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="font-display text-xl font-bold">{ownerName}</h1>
          <p className="text-muted-foreground">@{ownerUsername}</p>
        </div>
        {isGuest ? (
          <Link
            href="/signup"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-foreground/80 transition hover:bg-white/5"
          >
            {t("public.signUpToFollow")}
          </Link>
        ) : (
          <FollowButton username={ownerUsername} initialFollowing={initialFollowing} />
        )}
      </div>
    </>
  );
}
