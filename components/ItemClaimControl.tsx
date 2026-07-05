"use client";

import { useEffect, useState } from "react";
import { ItemStatusBadge } from "@/components/ItemStatusBadge";
import { useLanguage } from "@/components/LanguageProvider";
import type { ItemStatus } from "@/lib/types";

function useCountdown(target: Date | null) {
  const [remainingMs, setRemainingMs] = useState<number | null>(
    target ? target.getTime() - Date.now() : null
  );

  useEffect(() => {
    if (!target) {
      setRemainingMs(null);
      return;
    }
    const tick = () => setRemainingMs(target.getTime() - Date.now());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [target]);

  return remainingMs;
}

export function ItemClaimControl({
  itemId,
  initialStatus,
  initialIsOwnClaim,
  initialPlannedGiveDate,
  initialExpiringStartedAt,
}: {
  itemId: string;
  initialStatus: ItemStatus;
  initialIsOwnClaim: boolean;
  initialPlannedGiveDate?: string | null;
  initialExpiringStartedAt?: string | null;
}) {
  const { t } = useLanguage();
  const [status, setStatus] = useState<ItemStatus>(initialStatus);
  const [isOwnClaim, setIsOwnClaim] = useState(initialIsOwnClaim);
  const [plannedGiveDate, setPlannedGiveDate] = useState(initialPlannedGiveDate ?? null);
  const [expiringStartedAt, setExpiringStartedAt] = useState(initialExpiringStartedAt ?? null);
  const [dateInput, setDateInput] = useState(
    initialPlannedGiveDate ? initialPlannedGiveDate.slice(0, 10) : ""
  );
  const [showDateInput, setShowDateInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const releaseAt = expiringStartedAt
    ? new Date(new Date(expiringStartedAt).getTime() + 12 * 60 * 60 * 1000)
    : null;
  const remainingMs = useCountdown(status === "expiring" ? releaseAt : null);

  function formatCountdown(ms: number) {
    if (ms <= 0) return t("claim.anyMoment");
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  async function claim() {
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/items/${itemId}/claim`, { method: "POST" });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : t("claim.couldNotClaim"));
      return;
    }
    setStatus("claimed");
    setIsOwnClaim(true);
  }

  async function unclaim() {
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/items/${itemId}/claim`, { method: "DELETE" });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : t("claim.couldNotUnclaim"));
      return;
    }
    setStatus("available");
    setIsOwnClaim(false);
  }

  async function markGiven() {
    if (!confirm(t("claim.confirmGiven"))) return;
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/items/${itemId}/given`, { method: "POST" });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : t("claim.couldNotUpdate"));
      return;
    }
    setStatus("given");
  }

  async function saveDate() {
    if (!dateInput) return;
    setSubmitting(true);
    setError(null);
    const iso = new Date(`${dateInput}T00:00:00`).toISOString();
    const res = await fetch(`/api/items/${itemId}/claim`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plannedGiveDate: iso }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : t("claim.couldNotUpdateDate"));
      return;
    }
    setPlannedGiveDate(iso);
    setExpiringStartedAt(null);
    setStatus("claimed");
    setShowDateInput(false);
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <ItemStatusBadge status={status} />

      {status === "expiring" && remainingMs != null && (
        <p className="text-xs font-medium text-status-expiring">
          {t("claim.leftToReclaim", { time: formatCountdown(remainingMs) })}
        </p>
      )}

      {status === "available" && (
        <button
          onClick={claim}
          disabled={submitting}
          className="btn-gradient rounded-xl px-4 py-2 text-sm font-bold disabled:opacity-50"
        >
          {submitting ? t("claim.claiming") : t("claim.claim")}
        </button>
      )}

      {(status === "claimed" || status === "expiring") && isOwnClaim && (
        <div className="flex flex-col items-start gap-1.5">
          {plannedGiveDate && !showDateInput && (
            <p className="text-xs text-muted-foreground">
              {t("claim.plannedFor", { date: new Date(plannedGiveDate).toLocaleDateString() })}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={markGiven}
              disabled={submitting}
              className="btn-gradient rounded-xl px-4 py-2 text-sm font-bold disabled:opacity-50"
            >
              {t("claim.markAsGiven")}
            </button>
            <button
              onClick={() => setShowDateInput((s) => !s)}
              disabled={submitting}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-foreground/80 transition hover:bg-white/5 disabled:opacity-50"
            >
              {plannedGiveDate ? t("claim.extendDate") : t("claim.setDate")}
            </button>
            <button
              onClick={unclaim}
              disabled={submitting}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-foreground/60 transition hover:bg-white/5 disabled:opacity-50"
            >
              {t("claim.unclaim")}
            </button>
          </div>
          {showDateInput && (
            <div className="flex gap-1.5">
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="rounded-lg border border-white/10 bg-transparent px-2 py-2 text-sm"
              />
              <button
                onClick={saveDate}
                disabled={submitting || !dateInput}
                className="btn-gradient rounded-xl px-4 py-2 text-sm font-bold disabled:opacity-50"
              >
                {t("claim.save")}
              </button>
            </div>
          )}
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
