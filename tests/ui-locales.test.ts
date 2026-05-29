import { describe, expect, it } from "vitest";
import { getUiText, UI_LOCALES, REGION_LABELS, BROWSER_LANG_MAP } from "../src/config/ui-locales.js";

describe("UI 多语言配置", () => {
  it("getUiText 应返回对应地区的文案", () => {
    const en = getUiText("en-US");
    expect(en.home).toBe("Home");
    expect(en.search).toBe("Search wallpapers...");

    const zh = getUiText("zh-CN");
    expect(zh.home).toBe("首页");
    expect(zh.search).toBe("搜索壁纸...");

    const ja = getUiText("ja-JP");
    expect(ja.home).toBe("ホーム");

    const de = getUiText("de-DE");
    expect(de.home).toBe("Startseite");

    const fr = getUiText("fr-FR");
    expect(fr.home).toBe("Accueil");
  });

  it("getUiText 未知地区应回退到 en-US", () => {
    const result = getUiText("xx-XX");
    expect(result.home).toBe("Home");
  });

  it("UI_LOCALES 应覆盖所有配置地区", () => {
    const regions = Object.keys(UI_LOCALES);
    expect(regions).toContain("en-US");
    expect(regions).toContain("zh-CN");
    expect(regions).toContain("ja-JP");
    expect(regions).toContain("de-DE");
    expect(regions).toContain("fr-FR");
    expect(regions).toContain("ko-KR");
    expect(regions).toContain("pt-BR");
  });

  it("所有 UI_LOCALES 条目应包含完整字段", () => {
    for (const [region, locale] of Object.entries(UI_LOCALES)) {
      expect(locale.home, `${region} home`).toBeTruthy();
      expect(locale.search, `${region} search`).toBeTruthy();
      expect(locale.latestWallpapers, `${region} latestWallpapers`).toBeTruthy();
      expect(locale.download4K, `${region} download4K`).toBeTruthy();
      expect(locale.backHome, `${region} backHome`).toBeTruthy();
      expect(locale.footer.description, `${region} footer.description`).toBeTruthy();
    }
  });

  it("REGION_LABELS 应包含所有配置地区", () => {
    expect(REGION_LABELS["en-US"]).toBe("English (US)");
    expect(REGION_LABELS["zh-CN"]).toBe("中文 (中国)");
    expect(REGION_LABELS["ja-JP"]).toBe("日本語");
    expect(REGION_LABELS["ko-KR"]).toBe("한국어");
  });

  it("BROWSER_LANG_MAP 应正确映射浏览器语言", () => {
    expect(BROWSER_LANG_MAP["zh"]).toBe("zh-CN");
    expect(BROWSER_LANG_MAP["zh-cn"]).toBe("zh-CN");
    expect(BROWSER_LANG_MAP["ja"]).toBe("ja-JP");
    expect(BROWSER_LANG_MAP["de"]).toBe("de-DE");
    expect(BROWSER_LANG_MAP["fr"]).toBe("fr-FR");
    expect(BROWSER_LANG_MAP["ko"]).toBe("ko-KR");
    expect(BROWSER_LANG_MAP["en"]).toBe("en-US");
  });
});
