import { describe, expect, it } from "vitest";
import {
  normalizeBingImage,
  normalizeBingImages,
} from "../src/bing/normalize-bing-image.js";
import type { BingImage } from "../src/bing/bing-types.js";

function createMockBingImage(overrides: Partial<BingImage> = {}): BingImage {
  return {
    startdate: "20260529",
    fullstartdate: "202605290000",
    enddate: "20260530",
    url: "/th?id=OHR.MachuPicchu_EN-US1234567890",
    urlbase: "/th?id=OHR.MachuPicchu_EN-US1234567890",
    copyright: "Machu Picchu, Peru (© Photographer Name)",
    copyrightlink: "https://www.bing.com/search?q=Machu+Picchu",
    title: "Machu Picchu",
    quiz: "/search?q=Bing+homepage+quiz&filters=...",
    wp: true,
    hsh: "abc123def456",
    drk: 1,
    top: 1,
    bot: 1,
    hs: [],
    ...overrides,
  };
}

describe("规范化模块", () => {
  it("应正确转换单张 Bing 图片为 Wallpaper", () => {
    const bingImage = createMockBingImage();
    const result = normalizeBingImage(bingImage, "en-US");

    expect(result.region).toBe("en-US");
    expect(result.date).toBe("2026-05-29");
    expect(result.title).toBe("Machu Picchu");
    expect(result.copyright).toContain("Machu Picchu");
    expect(result.id).toContain("en-US");
    expect(result.id).toContain("2026-05-29");
    expect(result.id).toContain("abc123def456");
    expect(result.imageUrl).toContain("bing.com");
    expect(result.downloadUrl).toContain("3840");
    expect(result.thumbnailUrl).toContain("384");
  });

  it("应从 copyright 提取标题当 title 为空时", () => {
    const bingImage = createMockBingImage({ title: "" });
    const result = normalizeBingImage(bingImage, "zh-CN");
    expect(result.title).toBe("Machu Picchu, Peru");
  });

  it("应正确格式化日期", () => {
    const bingImage = createMockBingImage({ startdate: "20260105" });
    const result = normalizeBingImage(bingImage, "en-US");
    expect(result.date).toBe("2026-01-05");
  });

  it("应过滤无效图片", () => {
    const images = [
      createMockBingImage(),
      createMockBingImage({ url: "", startdate: "" }),
      createMockBingImage({ url: "/th?id=valid", startdate: "20260530" }),
    ];
    const result = normalizeBingImages(images, "en-US");
    expect(result).toHaveLength(2);
  });

  it("应生成稳定的 ID", () => {
    const img1 = normalizeBingImage(createMockBingImage(), "en-US");
    const img2 = normalizeBingImage(createMockBingImage(), "en-US");
    expect(img1.id).toBe(img2.id);
  });

  it("不同区域应生成不同 ID", () => {
    const img1 = normalizeBingImage(createMockBingImage(), "en-US");
    const img2 = normalizeBingImage(createMockBingImage(), "zh-CN");
    expect(img1.id).not.toBe(img2.id);
  });
});
