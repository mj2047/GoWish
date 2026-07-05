import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { z } from "zod";
import { auth } from "@/auth";

const bodySchema = z.object({ url: z.string().url() });

function isBlockedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (lower === "localhost" || lower === "::1" || lower === "0.0.0.0") return true;
  if (/^127\./.test(lower)) return true;
  if (/^10\./.test(lower)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(lower)) return true;
  if (/^192\.168\./.test(lower)) return true;
  if (/^169\.254\./.test(lower)) return true;
  return false;
}

function parsePrice(text: string | undefined): number | undefined {
  if (!text) return undefined;
  const match = text.replace(/,/g, "").match(/(\d+(\.\d+)?)/);
  return match ? Number(match[1]) : undefined;
}

function resolveUrl(maybeRelative: string | undefined, base: string): string | undefined {
  if (!maybeRelative) return undefined;
  try {
    return new URL(maybeRelative, base).toString();
  } catch {
    return undefined;
  }
}

const EMPTY_RESULT = { title: null, imageUrl: null, price: null };

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }
  const { url } = parsed.data;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }
  if (!["http:", "https:"].includes(parsedUrl.protocol) || isBlockedHost(parsedUrl.hostname)) {
    return NextResponse.json({ error: "That link can't be fetched" }, { status: 400 });
  }

  // Scraping is best-effort — any failure here falls back to manual entry on
  // the client, so we always resolve with a 200 rather than erroring out.
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; WishlistBot/1.0)",
        Accept: "text/html",
      },
      redirect: "follow",
    });
    clearTimeout(timeout);

    const contentType = res.headers.get("content-type") ?? "";
    if (!res.ok || !contentType.includes("text/html")) {
      return NextResponse.json(EMPTY_RESULT);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content") ||
      $("title").first().text() ||
      null;

    const rawImage =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content");
    const imageUrl = resolveUrl(rawImage, url) ?? null;

    const rawPrice =
      $('meta[property="product:price:amount"]').attr("content") ||
      $('meta[property="og:price:amount"]').attr("content") ||
      $('[itemprop="price"]').attr("content") ||
      $('[itemprop="price"]').first().text();
    const price = parsePrice(rawPrice) ?? null;

    return NextResponse.json({ title: title?.trim() || null, imageUrl, price });
  } catch {
    return NextResponse.json(EMPTY_RESULT);
  }
}
