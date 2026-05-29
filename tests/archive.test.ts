import { describe, expect, it } from "vitest";
import { groupByMonth } from "../src/domain/archive.js";
import type { Wallpaper } from "../src/domain/wallpaper.js";

function createMockWallpaper(date: string, region = "en-US"): Wallpaper {
  return {
    id: `${region}:${date}:test`,
    region,
    date,
    title: `Wallpaper ${date}`,
    copyright: `Copyright ${date}`,
    imageUrl: "https://www.bing.com/th?id=test",
    downloadUrl: "https://www.bing.com/th?id=test&w=3840&h=2160",
    thumbnailUrl: "https://www.bing.com/th?id=test&w=480&h=270",
    sourceUrl: "https://www.bing.com/search?q=test",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("归档分组", () => {
  it("应按月份正确分组", () => {
    const wallpapers = [
      createMockWallpaper("2026-05-29"),
      createMockWallpaper("2026-05-28"),
      createMockWallpaper("2026-04-15"),
      createMockWallpaper("2026-04-10"),
    ];
    const groups = groupByMonth(wallpapers);
    expect(groups).toHaveLength(2);
    expect(groups[0].key).toBe("2026-05");
    expect(groups[0].wallpapers).toHaveLength(2);
    expect(groups[1].key).toBe("2026-04");
    expect(groups[1].wallpapers).toHaveLength(2);
  });

  it("应按日期倒序排列月份", () => {
    const wallpapers = [
      createMockWallpaper("2026-01-10"),
      createMockWallpaper("2026-05-20"),
      createMockWallpaper("2026-03-15"),
    ];
    const groups = groupByMonth(wallpapers);
    expect(groups[0].key).toBe("2026-05");
    expect(groups[1].key).toBe("2026-03");
    expect(groups[2].key).toBe("2026-01");
  });

  it("空列表应返回空数组", () => {
    const groups = groupByMonth([]);
    expect(groups).toHaveLength(0);
  });
});
