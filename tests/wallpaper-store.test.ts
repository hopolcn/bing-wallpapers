import { describe, expect, it } from "vitest";
import {
  getLatestWallpapers,
  getWallpapersByMonth,
  getWallpapersByRegion,
  mergeWallpapers,
  sortByDateDesc,
} from "../src/storage/wallpaper-store.js";
import type { Wallpaper } from "../src/domain/wallpaper.js";

function createWallpaper(
  id: string,
  date: string,
  region = "en-US",
  overrides: Partial<Wallpaper> = {}
): Wallpaper {
  return {
    id,
    region,
    date,
    title: `Title ${id}`,
    copyright: `Copyright ${id}`,
    imageUrl: "https://www.bing.com/th?id=test",
    downloadUrl: "https://www.bing.com/th?id=test&w=3840&h=2160",
    thumbnailUrl: "https://www.bing.com/th?id=test&w=480&h=270",
    sourceUrl: "https://www.bing.com/search?q=test",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("存储模块 - 排序", () => {
  it("应按日期倒序排列", () => {
    const wallpapers = [
      createWallpaper("a", "2026-01-10"),
      createWallpaper("b", "2026-05-29"),
      createWallpaper("c", "2026-03-15"),
    ];
    const sorted = sortByDateDesc(wallpapers);
    expect(sorted[0].date).toBe("2026-05-29");
    expect(sorted[1].date).toBe("2026-03-15");
    expect(sorted[2].date).toBe("2026-01-10");
  });
});

describe("存储模块 - 合并去重", () => {
  it("应添加新数据", () => {
    const existing = [createWallpaper("a", "2026-05-28")];
    const incoming = [createWallpaper("b", "2026-05-29")];
    const result = mergeWallpapers(existing, incoming);
    expect(result).toHaveLength(2);
  });

  it("应按 ID 去重并更新已有记录", () => {
    const existing = [
      createWallpaper("a", "2026-05-29", "en-US", { title: "Old Title" }),
    ];
    const incoming = [
      createWallpaper("a", "2026-05-29", "en-US", { title: "New Title" }),
    ];
    const result = mergeWallpapers(existing, incoming);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("New Title");
  });

  it("空列表合并应返回新数据", () => {
    const incoming = [
      createWallpaper("a", "2026-05-29"),
      createWallpaper("b", "2026-05-28"),
    ];
    const result = mergeWallpapers([], incoming);
    expect(result).toHaveLength(2);
  });

  it("重复运行不应增加数据量", () => {
    const wallpapers = [
      createWallpaper("a", "2026-05-29"),
      createWallpaper("b", "2026-05-28"),
    ];
    const result1 = mergeWallpapers([], wallpapers);
    const result2 = mergeWallpapers(result1, wallpapers);
    expect(result2).toHaveLength(2);
  });
});

describe("存储模块 - 筛选", () => {
  const wallpapers = [
    createWallpaper("a", "2026-05-29", "en-US"),
    createWallpaper("b", "2026-05-28", "zh-CN"),
    createWallpaper("c", "2026-05-27", "en-US"),
    createWallpaper("d", "2026-04-15", "en-US"),
    createWallpaper("e", "2026-04-10", "zh-CN"),
  ];

  it("getLatestWallpapers 应返回指定数量的最新数据", () => {
    const latest = getLatestWallpapers(wallpapers, 3);
    expect(latest).toHaveLength(3);
    expect(latest[0].date).toBe("2026-05-29");
  });

  it("getWallpapersByMonth 应按月份筛选", () => {
    const may = getWallpapersByMonth(wallpapers, "2026-05");
    expect(may).toHaveLength(3);
    const april = getWallpapersByMonth(wallpapers, "2026-04");
    expect(april).toHaveLength(2);
  });

  it("getWallpapersByRegion 应按地区筛选", () => {
    const enUS = getWallpapersByRegion(wallpapers, "en-US");
    expect(enUS).toHaveLength(3);
    const zhCN = getWallpapersByRegion(wallpapers, "zh-CN");
    expect(zhCN).toHaveLength(2);
  });
});
