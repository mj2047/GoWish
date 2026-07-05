"use client";

import { useState } from "react";
import { Gift, Plus } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

type OwnerItem = {
  id: string;
  title: string;
  imageUrl: string | null;
  price: number | null;
  sourceUrl: string | null;
};

type FormState = {
  title: string;
  imageUrl: string;
  price: string;
  sourceUrl: string;
};

const emptyForm: FormState = { title: "", imageUrl: "", price: "", sourceUrl: "" };

function GiftPlaceholder() {
  return (
    <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-brand/20">
      <Gift className="h-10 w-10 text-muted-foreground" />
    </div>
  );
}

export function ItemList({ initialItems }: { initialItems: OwnerItem[] }) {
  const { t } = useLanguage();
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [linkInput, setLinkInput] = useState("");
  const [fetchingLink, setFetchingLink] = useState(false);
  const [clipNotice, setClipNotice] = useState<string | null>(null);
  const [autoFetched, setAutoFetched] = useState(false);

  function startEdit(item: OwnerItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      imageUrl: item.imageUrl ?? "",
      price: item.price?.toString() ?? "",
      sourceUrl: item.sourceUrl ?? "",
    });
    setShowForm(true);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setShowForm(false);
    setLinkInput("");
    setClipNotice(null);
    setAutoFetched(false);
  }

  async function handleFetchLink() {
    if (!linkInput) return;
    setFetchingLink(true);
    setClipNotice(null);

    try {
      const res = await fetch("/api/clip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: linkInput }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.title) {
        setForm((f) => ({
          title: data.title,
          imageUrl: data.imageUrl || f.imageUrl,
          price: data.price != null ? String(data.price) : f.price,
          sourceUrl: linkInput,
        }));
        setAutoFetched(true);
        setClipNotice(t("list.clipSuccess"));
      } else {
        // Scraping failed — never block adding the item, just hand off to manual entry.
        setForm((f) => ({ ...f, sourceUrl: linkInput }));
        setAutoFetched(false);
        setClipNotice(t("list.clipFailure"));
      }
    } catch {
      setForm((f) => ({ ...f, sourceUrl: linkInput }));
      setAutoFetched(false);
      setClipNotice(t("list.clipFailure"));
    } finally {
      setFetchingLink(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = {
      title: form.title,
      imageUrl: form.imageUrl || undefined,
      price: form.price ? Number(form.price) : undefined,
      sourceUrl: form.sourceUrl || undefined,
      addedManually: !autoFetched,
    };

    const res = await fetch(editingId ? `/api/items/${editingId}` : "/api/items", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : t("list.somethingWrong"));
      return;
    }

    const saved: OwnerItem = await res.json();
    setItems((prev) =>
      editingId ? prev.map((it) => (it.id === saved.id ? saved : it)) : [saved, ...prev]
    );
    cancelEdit();
  }

  async function handleDelete(id: string) {
    if (!confirm(t("list.deleteConfirm"))) return;
    const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((it) => it.id !== id));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">
          {items.length} {items.length === 1 ? t("list.itemSingular") : t("list.itemPlural")}
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-gradient flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold"
          >
            <Plus className="h-4 w-4" />
            {t("list.addItem")}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass flex flex-col gap-3 rounded-3xl p-5">
          <h3 className="font-display text-sm font-semibold text-muted-foreground">
            {editingId ? t("list.editItem") : t("list.addAnItem")}
          </h3>

          {!editingId && (
            <div className="ring-gradient flex flex-col gap-2 rounded-2xl bg-white/[0.03] p-3">
              <label className="text-xs font-semibold text-muted-foreground">
                {t("list.pasteLink")}
              </label>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm"
                  placeholder={t("list.linkInputPlaceholder")}
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleFetchLink}
                  disabled={fetchingLink || !linkInput}
                  className="btn-gradient rounded-xl px-3 py-2 text-sm font-bold disabled:opacity-50"
                >
                  {fetchingLink ? t("list.fetching") : t("list.fetchDetails")}
                </button>
              </div>
              {clipNotice && <p className="text-xs text-muted-foreground">{clipNotice}</p>}
            </div>
          )}

          <input
            className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm"
            placeholder={t("list.titlePlaceholder")}
            value={form.title}
            onChange={(e) => {
              setForm((f) => ({ ...f, title: e.target.value }));
              setAutoFetched(false);
            }}
            required
          />
          <input
            className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm"
            placeholder={t("list.imageUrlPlaceholder")}
            value={form.imageUrl}
            onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
          />
          <div className="flex gap-3">
            <input
              className="w-32 rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm"
              placeholder={t("list.pricePlaceholder")}
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            />
            <input
              className="flex-1 rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm"
              placeholder={t("list.linkPlaceholder")}
              value={form.sourceUrl}
              onChange={(e) => setForm((f) => ({ ...f, sourceUrl: e.target.value }))}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn-gradient rounded-xl px-4 py-2 text-sm font-bold disabled:opacity-50"
            >
              {submitting ? t("list.saving") : editingId ? t("list.saveChanges") : t("list.addItem")}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-foreground/80 transition hover:bg-white/5"
            >
              {t("list.cancel")}
            </button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <div className="glass flex flex-col items-center gap-3 rounded-3xl border-dashed py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-brand/20">
            <Gift className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">{t("list.noItemsYet")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="glass card-hover group overflow-hidden rounded-3xl">
              <div className="relative aspect-[4/3] overflow-hidden">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <GiftPlaceholder />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {item.price != null && (
                  <div className="absolute bottom-3 right-3 rounded-full bg-black/40 px-2.5 py-1 text-sm font-bold text-white backdrop-blur">
                    ${item.price.toFixed(2)}
                  </div>
                )}
              </div>
              <div className="space-y-3 p-4">
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{item.title}</h3>
                {item.sourceUrl && (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  >
                    {t("list.viewOriginal")}
                  </a>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(item)}
                    className="flex-1 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                  >
                    {t("list.edit")}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-destructive/20 hover:text-destructive"
                  >
                    {t("list.delete")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
