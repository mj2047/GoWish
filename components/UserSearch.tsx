"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

type UserResult = { username: string; name: string; profilePhotoUrl: string | null };

export function UserSearch() {
  const router = useRouter();
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        setResults(await res.json());
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  function openSearch() {
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function goToUser(username: string) {
    setOpen(false);
    setQuery("");
    router.push(`/users/${username}`);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={openSearch}
        aria-label={t("nav.addFriend")}
        className="rounded-xl p-2 text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
      >
        <UserPlus className="h-5 w-5" />
      </button>
      {open && (
        <div className="glass absolute left-0 top-full z-20 mt-2 w-64 rounded-2xl p-2 shadow-lg">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("nav.findSomeone")}
            className="w-full rounded-full border border-white/10 bg-transparent px-3 py-1.5 text-sm"
          />
          {query.trim().length >= 2 && (
            <div className="mt-2">
              {results.length === 0 ? (
                <p className="p-2 text-sm text-muted-foreground">{t("nav.noUsersFound")}</p>
              ) : (
                <ul>
                  {results.map((user) => (
                    <li key={user.username}>
                      <button
                        onClick={() => goToUser(user.username)}
                        className="flex w-full items-center gap-2 rounded-xl p-2 text-left text-sm transition hover:bg-white/5"
                      >
                        {user.profilePhotoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.profilePhotoUrl}
                            alt=""
                            className="h-7 w-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-brand text-xs font-semibold text-white">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">@{user.username}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
