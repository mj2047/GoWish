"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { NotificationBell } from "@/components/NotificationBell";
import { UserSearch } from "@/components/UserSearch";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/components/LanguageProvider";

function Wordmark() {
  return (
    <Link href="/" className="font-display text-2xl font-black tracking-tight sm:text-3xl">
      <span className="text-gradient">Go</span>
      <span>Wish</span>
      <span className="text-gradient">.</span>
    </Link>
  );
}

export function NavBar() {
  const { data: session, status } = useSession();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 px-4 pt-4">
      <nav className="glass-strong mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-2 rounded-2xl px-4 py-2.5">
        <Wordmark />
        <div className="flex flex-wrap items-center gap-1 text-sm">
          {status === "authenticated" ? (
            <>
              <UserSearch />
              <Link
                href="/list"
                className="rounded-xl px-2.5 py-2 text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
              >
                {t("nav.myList")}
              </Link>
              <Link
                href="/profile"
                className="rounded-xl px-2.5 py-2 text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
              >
                {t("nav.profile")}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-xl px-2.5 py-2 text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
              >
                {t("nav.logout")}
              </button>
              <NotificationBell />
              <LanguageSwitcher />
              <Link
                href="/profile"
                className="ml-1 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ring-2 ring-white/10 transition hover:ring-white/30"
              >
                {session.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.user.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-gradient-brand text-xs font-bold text-white">
                    {(session.user.name ?? session.user.username ?? "?").charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
            </>
          ) : status === "loading" ? null : (
            <>
              <Link
                href="/login"
                className="rounded-xl px-2.5 py-2 text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
              >
                {t("nav.login")}
              </Link>
              <Link
                href="/signup"
                className="btn-gradient ml-1 rounded-xl px-4 py-2 text-sm font-semibold"
              >
                {t("nav.signup")}
              </Link>
              <LanguageSwitcher />
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
