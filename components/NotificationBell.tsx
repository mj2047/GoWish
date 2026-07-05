"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

type Notification = {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export function NotificationBell() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  function timeAgo(iso: string) {
    const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (seconds < 60) return t("time.justNow");
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return t("time.minutesAgo", { n: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t("time.hoursAgo", { n: hours });
    const days = Math.floor(hours / 24);
    return t("time.daysAgo", { n: days });
  }

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : []))
      .then(setNotifications)
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) {
      await fetch("/api/notifications", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={toggleOpen}
        className="relative rounded-xl p-2 text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
        aria-label={t("nav.notifications")}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-brand px-1 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="glass absolute right-0 z-20 mt-2 w-72 rounded-2xl shadow-lg">
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">{t("notifications.empty")}</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <li key={n.id} className="border-b border-white/10 p-3 text-sm last:border-0">
                  <p>{t(n.message)}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(n.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
