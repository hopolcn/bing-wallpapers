import type { AppConfig } from "../config/default-config.js";
import type { BingArchiveResponse } from "./bing-types.js";

export interface FetchResult {
  region: string;
  images: BingArchiveResponse["images"];
  error?: string;
}

export async function fetchBingArchive(
  region: string,
  config: AppConfig
): Promise<FetchResult> {
  const url = buildArchiveUrl(region, config.bing.countPerRequest);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.bing.requestTimeoutMs);

    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "BingWallpapersBot/1.0",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return {
        region,
        images: [],
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = (await response.json()) as BingArchiveResponse;

    if (!data.images || !Array.isArray(data.images)) {
      return {
        region,
        images: [],
        error: "响应中缺少 images 数组",
      };
    }

    return { region, images: data.images };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      region,
      images: [],
      error: `请求失败: ${message}`,
    };
  }
}

export async function fetchAllRegions(config: AppConfig): Promise<FetchResult[]> {
  const results: FetchResult[] = [];

  for (const region of config.bing.regions) {
    const result = await fetchBingArchive(region, config);
    results.push(result);

    if (result.error) {
      console.warn(`区域 ${region} 获取失败: ${result.error}`);
    } else {
      console.log(`区域 ${region} 获取成功: ${result.images.length} 张壁纸`);
    }
  }

  return results;
}

function buildArchiveUrl(region: string, count: number): URL {
  const url = new URL("https://www.bing.com/HPImageArchive.aspx");
  url.searchParams.set("format", "js");
  url.searchParams.set("idx", "0");
  url.searchParams.set("n", String(count));
  url.searchParams.set("mkt", region);
  url.searchParams.set("uhd", "1");
  url.searchParams.set("uhdwidth", "3840");
  url.searchParams.set("uhdheight", "2160");
  return url;
}
