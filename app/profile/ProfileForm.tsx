"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";

export function ProfileForm({
  name: initialName,
  username: initialUsername,
  profilePhotoUrl: initialPhoto,
  publicShareSlug,
}: {
  name: string;
  username: string;
  profilePhotoUrl: string | null;
  publicShareSlug: string;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [name, setName] = useState(initialName);
  const [username, setUsername] = useState(initialUsername);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(initialPhoto ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSubmitting(true);

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, profilePhotoUrl }),
    });

    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Could not update profile");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="glass flex flex-col gap-6 rounded-3xl p-6">
      <h1 className="font-display text-2xl font-black">{t("profile.yourProfile")}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm text-muted-foreground">
          {t("profile.name")}
          <input
            className="rounded-xl border border-white/10 bg-transparent px-4 py-3 text-base text-foreground"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted-foreground">
          {t("profile.username")}
          <input
            className="rounded-xl border border-white/10 bg-transparent px-4 py-3 text-base text-foreground"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted-foreground">
          {t("profile.photoUrl")}
          <input
            className="rounded-xl border border-white/10 bg-transparent px-4 py-3 text-base text-foreground"
            value={profilePhotoUrl}
            onChange={(e) => setProfilePhotoUrl(e.target.value)}
            placeholder="https://..."
          />
        </label>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {saved && <p className="text-sm text-status-available">{t("profile.saved")}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="btn-gradient rounded-xl px-4 py-3 text-base font-bold disabled:opacity-50"
        >
          {submitting ? t("list.saving") : t("list.saveChanges")}
        </button>
      </form>
      <div className="rounded-xl border border-white/10 p-3 text-sm text-muted-foreground">
        {t("profile.publicShareLink")}{" "}
        <Link href={`/u/${publicShareSlug}`} className="underline underline-offset-2">
          /u/{publicShareSlug}
        </Link>
      </div>
    </div>
  );
}
