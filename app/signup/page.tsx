"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useLanguage } from "@/components/LanguageProvider";

export default function SignupPage() {
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

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Could not create account");
      setSubmitting(false);
      return;
    }

    const result = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
    });

    setSubmitting(false);
    if (result?.error) {
      setError("Account created, but login failed. Try logging in.");
      return;
    }
    router.push("/list");
  }

  return (
    <main className="relative flex flex-1 items-center justify-center px-6 py-16">
      <div className="glass mx-auto w-full max-w-sm rounded-3xl p-6">
        <h1 className="font-display mb-4 text-2xl font-black">{t("signup.title")}</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            className="rounded-xl border border-white/10 bg-transparent px-4 py-3 text-base"
            placeholder={t("signup.identifierPlaceholder")}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          <input
            className="rounded-xl border border-white/10 bg-transparent px-4 py-3 text-base"
            placeholder={t("signup.passwordPlaceholder")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="btn-gradient rounded-xl px-4 py-3 text-base font-bold disabled:opacity-50"
          >
            {submitting ? t("signup.submitting") : t("signup.submit")}
          </button>
        </form>
      </div>
    </main>
  );
}
