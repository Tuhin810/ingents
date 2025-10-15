import { NextResponse } from "next/server";

function absoluteUrl(base: string, href: string) {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    if (!url) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    // basic URL validation
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch (_err) {
      void _err;
      return NextResponse.json({ error: "Invalid url" }, { status: 400 });
    }

    if (!/^https?:$/.test(parsedUrl.protocol)) {
      return NextResponse.json(
        { error: "Only http(s) allowed" },
        { status: 400 }
      );
    }

    const res = await fetch(parsedUrl.toString(), { next: { revalidate: 60 } });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch site" },
        { status: 502 }
      );
    }

    const html = await res.text();

    // extract <title>
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : null;

    // extract og:image
    const ogImageMatch = html.match(
      /<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i
    );
    const ogImage = ogImageMatch
      ? absoluteUrl(parsedUrl.toString(), ogImageMatch[1])
      : null;

    // extract favicon
    // look for link rel ICON or shortcut icon
    const iconMatch = html.match(
      /<link[^>]+rel=["']([^"']*icon[^"']*)["'][^>]*href=["']([^"']+)["'][^>]*>/i
    );
    const favicon = iconMatch
      ? absoluteUrl(parsedUrl.toString(), iconMatch[2])
      : null;

    // fallback bare hostname as name
    const name = title || parsedUrl.hostname;

    return NextResponse.json({ name, title, favicon, ogImage });
  } catch (_err2) {
    void _err2;
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
