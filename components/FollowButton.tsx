"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

export function FollowButton({
  username,
  initialFollowing,
}: {
  username: string;
  initialFollowing: boolean;
}) {
  const { t } = useLanguage();
  const [following, setFollowing] = useState(initialFollowing);
  const [submitting, setSubmitting] = useState(false);

  async function toggle() {
    setSubmitting(true);
    const res = await fetch(`/api/follow/${username}`, {
      method: following ? "DELETE" : "POST",
    });
    setSubmitting(false);
    if (res.ok) {
      setFollowing(!following);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={submitting}
      className={
        following
          ? "rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-foreground/80 transition hover:bg-white/5 disabled:opacity-50"
          : "btn-gradient rounded-xl px-4 py-2 text-sm font-bold disabled:opacity-50"
      }
    >
      {following ? t("follow.following") : t("follow.follow")}
    </button>
  );
}
