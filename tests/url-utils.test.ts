import { describe, expect, it } from "vitest";
import {
  buildBingArchiveUrl,
  buildDownloadUrl,
  buildThumbnailUrl,
  isTrustedUrl,
  toAbsoluteUrl,
} from "../src/utils/url-utils.js";

describe("URL 工具函数", () => {
  it("buildBingArchiveUrl 应构造正确的 Bing API URL", () => {
    const url = buildBingArchiveUrl("en-US", 8);
    expect(url.hostname).toBe("www.bing.com");
    expect(url.pathname).toBe("/HPImageArchive.aspx");
    expect(url.searchParams.get("format")).toBe("js");
    expect(url.searchParams.get("mkt")).toBe("en-US");
    expect(url.searchParams.get("n")).toBe("8");
    expect(url.searchParams.get("uhd")).toBe("1");
  });

  it("toAbsoluteUrl 应将相对路径转为绝对 URL", () => {
    const result = toAbsoluteUrl("/th?id=OHR.Test");
    expect(result).toBe("https://www.bing.com/th?id=OHR.Test");
  });

  it("toAbsoluteUrl 不修改已是绝对的 URL", () => {
    const url = "https://www.bing.com/th?id=OHR.Test";
    expect(toAbsoluteUrl(url)).toBe(url);
  });

  it("buildDownloadUrl 应添加宽高参数", () => {
    const result = buildDownloadUrl("/th?id=OHR.Test");
    expect(result).toContain("w=3840");
    expect(result).toContain("h=2160");
  });

  it("buildThumbnailUrl 应添加缩略图宽高", () => {
    const result = buildThumbnailUrl("/th?id=OHR.Test");
    expect(result).toContain("w=480");
    expect(result).toContain("h=270");
  });

  it("isTrustedUrl 应信任 bing.com 域名", () => {
    expect(isTrustedUrl("https://www.bing.com/test")).toBe(true);
    expect(isTrustedUrl("https://cn.bing.com/test")).toBe(true);
    expect(isTrustedUrl("https://evil.com/test")).toBe(false);
  });
});
