import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import dns from "node:dns/promises";
import net from "node:net";
import * as cheerio from "cheerio";
import { getAdminSession } from "@/lib/adminAuth";

const bodySchema = z.object({ url: z.string().url() });

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

// Blocks the obvious SSRF targets (loopback/private/link-local ranges) by resolving
// the hostname ourselves before every request — including redirect hops, since
// fetch()'s built-in redirect handling would otherwise skip this check entirely.
function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  }
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === "::1" || lower === "::") return true;
    if (lower.startsWith("fe80:") || lower.startsWith("fc") || lower.startsWith("fd")) return true;
    if (lower.startsWith("::ffff:")) return isPrivateIp(lower.slice("::ffff:".length));
    return false;
  }
  return true;
}

async function assertPublicHost(hostname: string) {
  const addresses = await dns.lookup(hostname, { all: true });
  if (addresses.length === 0 || addresses.some((a) => isPrivateIp(a.address))) {
    throw new Error("That link is not allowed");
  }
}

async function safeFetch(initialUrl: URL): Promise<Response> {
  let current = initialUrl;
  for (let hop = 0; hop < 5; hop++) {
    await assertPublicHost(current.hostname);
    const res = await fetch(current.toString(), {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      redirect: "manual",
      signal: AbortSignal.timeout(8000),
    });
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) throw new Error("Redirect with no location");
      current = new URL(location, current);
      if (current.protocol !== "http:" && current.protocol !== "https:") {
        throw new Error("Unsupported redirect protocol");
      }
      continue;
    }
    return res;
  }
  throw new Error("Too many redirects");
}

export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Paste a valid product link first" }, { status: 400 });
  }

  const target = new URL(parsed.data.url);
  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return NextResponse.json({ error: "Only http/https links are supported" }, { status: 400 });
  }

  let html: string;
  try {
    const res = await safeFetch(target);
    if (!res.ok) {
      return NextResponse.json({ error: `Supplier page returned ${res.status}` }, { status: 400 });
    }
    html = await res.text();
  } catch {
    return NextResponse.json(
      { error: "Could not fetch that link automatically — fill in the details below instead" },
      { status: 400 }
    );
  }

  const $ = cheerio.load(html);
  const meta = (name: string) =>
    $(`meta[property="${name}"]`).attr("content")?.trim() || $(`meta[name="${name}"]`).attr("content")?.trim() || "";

  const titleEn = meta("og:title") || $("title").first().text().trim();
  const imageUrl = meta("og:image");
  const descriptionEn = meta("og:description") || meta("description");
  const priceRaw = meta("product:price:amount") || meta("og:price:amount");
  const price = priceRaw ? Number(priceRaw.replace(/[^0-9.]/g, "")) : undefined;

  return NextResponse.json({
    titleEn,
    imageUrl,
    descriptionEn,
    price: price && !Number.isNaN(price) ? price : undefined,
  });
}
