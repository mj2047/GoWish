"use client";

import { useEffect, useState } from "react";

type FallingItem = {
  id: number;
  imageUrl: string;
  left: number;
  size: number;
  duration: number;
  delay: number;
  rotate: number;
};

const ITEM_COUNT = 16;

export function FallingProducts() {
  const [items, setItems] = useState<FallingItem[]>([]);

  // Randomize client-side only, after mount, so server and client markup match.
  useEffect(() => {
    let cancelled = false;

    const FOOD_AND_DRINK_CATEGORIES = new Set(["groceries"]);

    async function loadProductImages() {
      let images: string[] = [];
      try {
        const res = await fetch(
          "https://dummyjson.com/products?limit=100&select=thumbnail,category"
        );
        const data = await res.json();
        images = (data.products as { thumbnail: string; category: string }[])
          .filter((p) => !FOOD_AND_DRINK_CATEGORIES.has(p.category))
          .map((p) => p.thumbnail);
      } catch {
        // fall back to a generic placeholder if the catalog API is unreachable
        images = [`https://picsum.photos/seed/fallback/260/260`];
      }
      if (cancelled || images.length === 0) return;

      setItems(
        Array.from({ length: ITEM_COUNT }, (_, id) => ({
          id,
          imageUrl: images[Math.floor(Math.random() * images.length)],
          left: Math.random() * 100,
          size: 60 + Math.random() * 90,
          duration: 20 + Math.random() * 18,
          delay: -Math.random() * 25,
          rotate: Math.random() > 0.5 ? 1 : -1,
        }))
      );
    }

    loadProductImages();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((item) => (
        <img
          key={item.id}
          src={item.imageUrl}
          alt=""
          className="falling-product absolute top-0 rounded-2xl object-cover mix-blend-screen blur-[0.5px]"
          style={
            {
              left: `${item.left}%`,
              width: item.size,
              height: item.size,
              opacity: 0.12 + ((item.id * 13) % 20) / 100,
              filter: "saturate(0.85)",
              animationDuration: `${item.duration}s`,
              animationDelay: `${item.delay}s`,
              "--rotate-dir": item.rotate,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
