import { describe, expect, it } from "vitest";
import {
  buildIndexContext,
  buildMonthContext,
  buildDetailContext,
} from "../src/render/page-context.js";
import { defaultConfig } from "../src/config/default-config.js";
import type { Wallpaper } from "../src/domain/wallpaper.js";

function createWallpaper(date: string, region = "en-US"): Wallpaper {
  return {
    id: `${region}:${date}:test`,
    region,
    date,
    title: `Title ${date}`,
    copyright: `Copyright ${date}`,
    imageUrl: "https://www.bing.com/th?id=test",
    downloadUrl: "https://www.bing.com/th?id=test&w=3840&h=2160",
    thumbnailUrl: "https://www.bing.com/th?id=test&w=384&h=216",
    sourceUrl: "https://www.bing.com/search?q=test",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("页面上下文构建", () => {
  it("buildIndexContext 应构建首页上下文", () => {
    const wallpapers = [
      createWallpaper("2026-05-29"),
      createWallpaper("2026-05-28"),
      createWallpaper("2026-04-15"),
    ];
    const ctx = buildIndexContext(defaultConfig, wallpapers, "en-US");
    expect(ctx.pageTitle).toBe("Latest Wallpapers");
    expect(ctx.region).toBe("en-US");
    expect(ctx.uiText.home).toBe("Home");
    expect(ctx.todayWallpaper).not.toBeNull();
    expect(ctx.wallpapers).toHaveLength(3);
    expect(ctx.months).toHaveLength(2);
    expect(ctx.regions).toContain("en-US");
    expect(ctx.availableRegions).toEqual(defaultConfig.bing.regions);
    expect(ctx.regionLabels["en-US"]).toBe("English (US)");
  });

  it("buildIndexContext 应支持中文", () => {
    const wallpapers = [createWallpaper("2026-05-29", "zh-CN")];
    const ctx = buildIndexContext(defaultConfig, wallpapers, "zh-CN");
    expect(ctx.pageTitle).toBe("最新壁纸");
    expect(ctx.region).toBe("zh-CN");
    expect(ctx.uiText.home).toBe("首页");
    expect(ctx.uiText.search).toBe("搜索壁纸...");
  });

  it("buildMonthContext 应构建月度上下文", () => {
    const wallpapers = [createWallpaper("2026-05-29"), createWallpaper("2026-05-28")];
    const ctx = buildMonthContext(defaultConfig, "en-US", "2026-05", wallpapers, [
      "2026-05",
      "2026-04",
    ]);
    expect(ctx.monthKey).toBe("2026-05");
    expect(ctx.wallpaperCount).toBe(2);
    expect(ctx.prevMonth).toBe("2026-04");
    expect(ctx.nextMonth).toBeNull();
    expect(ctx.region).toBe("en-US");
  });

  it("buildDetailContext 应构建详情上下文", () => {
    const wp = createWallpaper("2026-05-29");
    const ctx = buildDetailContext(defaultConfig, "en-US", wp, {
      prev: "2026-05-28",
      next: null,
    });
    expect(ctx.wallpaper.date).toBe("2026-05-29");
    expect(ctx.prevDay).toBe("2026-05-28");
    expect(ctx.nextDay).toBeNull();
    expect(ctx.monthKey).toBe("2026-05");
    expect(ctx.region).toBe("en-US");
    expect(ctx.uiText.download4K).toBe("Download 4K Wallpaper");
  });

  it("空壁纸列表应安全处理", () => {
    const ctx = buildIndexContext(defaultConfig, [], "en-US");
    expect(ctx.todayWallpaper).toBeNull();
    expect(ctx.wallpapers).toHaveLength(0);
    expect(ctx.months).toHaveLength(0);
  });
});
