import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config/load-config.js";

describe("配置模块", () => {
  it("loadConfig 应返回默认配置", () => {
    const config = loadConfig();
    expect(config.site.title).toBe("Bing Wallpapers");
    expect(config.bing.regions).toContain("en-US");
    expect(config.bing.regions).toContain("zh-CN");
    expect(config.bing.countPerRequest).toBe(8);
    expect(config.archive.latestLimit).toBe(30);
    expect(config.git.autoCommit).toBe(false);
  });

  it("loadConfig 应读取环境变量覆盖默认配置", () => {
    const originalEnv = process.env.BING_REGIONS;
    process.env.BING_REGIONS = "ja-JP,de-DE";

    const config = loadConfig();
    expect(config.bing.regions).toEqual(["ja-JP", "de-DE"]);

    if (originalEnv !== undefined) {
      process.env.BING_REGIONS = originalEnv;
    } else {
      delete process.env.BING_REGIONS;
    }
  });
});
