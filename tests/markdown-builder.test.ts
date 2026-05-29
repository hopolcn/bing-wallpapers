import { describe, expect, it } from "vitest";
import { buildReadmeContent } from "../src/render/markdown-builder.js";
import type { Wallpaper } from "../src/domain/wallpaper.js";

function createWallpaper(date: string): Wallpaper {
  return {
    id: `en-US:${date}:test`,
    region: "en-US",
    date,
    title: `Test Title ${date}`,
    copyright: `Copyright ${date} (© Photographer)`,
    imageUrl: "https://www.bing.com/th?id=test",
    downloadUrl: "https://www.bing.com/th?id=test&w=3840&h=2160",
    thumbnailUrl: "https://www.bing.com/th?id=test&w=480&h=270",
    sourceUrl: "https://www.bing.com/search?q=test",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("Markdown 生成器", () => {
  it("应生成包含项目标题的 README", () => {
    const result = buildReadmeContent({
      title: "Bing Wallpapers",
      description: "测试描述",
      today: null,
      recentWallpapers: [],
      regions: ["en-US"],
      monthCount: 0,
    });
    expect(result).toContain("# Bing Wallpapers");
    expect(result).toContain("测试描述");
  });

  it("应包含今日壁纸信息", () => {
    const today = createWallpaper("2026-05-29");
    const result = buildReadmeContent({
      title: "Bing Wallpapers",
      description: "测试",
      today,
      recentWallpapers: [],
      regions: ["en-US"],
      monthCount: 1,
    });
    expect(result).toContain("## 今日壁纸");
    expect(result).toContain("2026-05-29");
  });

  it("应包含最新壁纸表格", () => {
    const wallpapers = [
      createWallpaper("2026-05-29"),
      createWallpaper("2026-05-28"),
    ];
    const result = buildReadmeContent({
      title: "Bing Wallpapers",
      description: "测试",
      today: null,
      recentWallpapers: wallpapers,
      regions: ["en-US"],
      monthCount: 1,
    });
    expect(result).toContain("## 最新壁纸");
    expect(result).toContain("| 日期 | 区域 | 预览 | 下载 |");
  });

  it("应包含许可证和声明", () => {
    const result = buildReadmeContent({
      title: "Bing Wallpapers",
      description: "测试",
      today: null,
      recentWallpapers: [],
      regions: ["en-US"],
      monthCount: 0,
    });
    expect(result).toContain("Apache License 2.0");
    expect(result).toContain("Microsoft");
  });
});
