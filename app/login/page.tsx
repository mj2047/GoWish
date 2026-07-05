"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useLanguage } from "@/components/LanguageProvider";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
    });

    setSubmitting(false);
    if (result?.error) {
      setError(t("login.error"));
      return;
    }
    router.push("/list");
  }

  return (
    <main className="relative flex flex-1 items-center justify-center px-6 py-16">
      <div className="glass mx-auto w-full max-w-sm rounded-3xl p-6">
        <h1 className="font-display mb-4 text-2xl font-black">{t("login.title")}</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            className="rounded-xl border border-white/10 bg-transparent px-4 py-3 text-base"
            placeholder={t("login.identifierPlaceholder")}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          <input
            className="rounded-xl border border-white/10 bg-transparent px-4 py-3 text-base"
            placeholder={t("login.passwordPlaceholder")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="btn-gradient rounded-xl px-4 py-3 text-base font-bold disabled:opacity-50"
          >
            {submitting ? t("login.submitting") : t("login.submit")}
          </button>
        </form>
      </div>
    </main>
  );
}
