"use client";

import Link from "next/link";
import { ArrowRight, Gift, Lock, Users } from "lucide-react";
import { FallingProducts } from "@/components/FallingProducts";
import { useLanguage } from "@/components/LanguageProvider";

const PREVIEW_IMAGES = [
  "https://picsum.photos/seed/gowish-preview-1/400/400",
  "https://picsum.photos/seed/gowish-preview-2/400/400",
  "https://picsum.photos/seed/gowish-preview-3/400/400",
  "https://picsum.photos/seed/gowish-preview-4/400/400",
];

export function HomeContent({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { t } = useLanguage();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <FallingProducts />
      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-24 pt-8 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="glass mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-status-available" />
            {t("home.badge")}
          </div>

          <h1 className="font-display text-5xl font-black leading-[0.95] sm:text-7xl md:text-8xl">
            {t("home.heading")}
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("home.subheading")}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={isLoggedIn ? "/list" : "/signup"}
              className="btn-gradient group inline-flex items-center gap-2 rounded-2xl px-7 py-4 text-base font-bold"
            >
              {t("home.goToList")}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <Link
              href={isLoggedIn ? "/profile" : "/login"}
              className="glass inline-flex items-center gap-2 rounded-2xl px-6 py-4 text-sm font-semibold text-foreground/80 transition hover:text-foreground"
            >
              {t("home.alreadyHaveOne")}
            </Link>
          </div>

          <div className="mt-6 text-xs text-muted-foreground">{t("home.trustLine")}</div>
        </div>

        {/* Feature strip */}
        <div className="mx-auto mt-24 grid max-w-4xl gap-4 sm:grid-cols-3">
          <Feature
            icon={<Lock className="h-5 w-5" />}
            title={t("home.feature1Title")}
            body={t("home.feature1Body")}
          />
          <Feature
            icon={<Gift className="h-5 w-5" />}
            title={t("home.feature2Title")}
            body={t("home.feature2Body")}
          />
          <Feature
            icon={<Users className="h-5 w-5" />}
            title={t("home.feature3Title")}
            body={t("home.feature3Body")}
          />
        </div>

        {/* Preview card */}
        <div className="mx-auto mt-24 max-w-4xl">
          <div className="glass ring-gradient rounded-[2rem] p-2">
            <div className="rounded-[1.75rem] bg-background/40 p-6 sm:p-10">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
                    {t("home.previewLabel")}
                  </div>
                  <div className="font-display text-2xl font-bold">
                    {t("home.previewListName")}
                  </div>
                </div>
                <div className="glass rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                  gowish.app/u/...
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {PREVIEW_IMAGES.map((src) => (
                  <div key={src} className="aspect-square overflow-hidden rounded-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-xs text-muted-foreground">
        {t("home.footer")}
      </footer>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="glass card-hover rounded-2xl p-5">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-white">
        {icon}
      </div>
      <div className="font-display text-lg font-bold">{title}</div>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
