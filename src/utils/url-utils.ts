const BING_BASE = "https://www.bing.com";

export function buildBingArchiveUrl(region: string, count: number): URL {
  const url = new URL("/HPImageArchive.aspx", BING_BASE);
  url.searchParams.set("format", "js");
  url.searchParams.set("idx", "0");
  url.searchParams.set("n", String(count));
  url.searchParams.set("mkt", region);
  url.searchParams.set("uhd", "1");
  url.searchParams.set("uhdwidth", "3840");
  url.searchParams.set("uhdheight", "2160");
  return url;
}

export function toAbsoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${BING_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function buildDownloadUrl(imageUrl: string, width = 3840, height = 2160): string {
  const url = new URL(imageUrl, BING_BASE);
  url.searchParams.set("w", String(width));
  url.searchParams.set("h", String(height));
  return url.toString();
}

export function buildThumbnailUrl(imageUrl: string, width = 480, height = 270): string {
  const url = new URL(imageUrl, BING_BASE);
  url.searchParams.set("w", String(width));
  url.searchParams.set("h", String(height));
  return url.toString();
}

const TRUSTED_HOSTS = ["www.bing.com", "cn.bing.com", "global.bing.com"];

export function isTrustedUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    return TRUSTED_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}
