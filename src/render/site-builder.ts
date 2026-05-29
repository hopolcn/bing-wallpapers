import { resolve } from "node:path";
import { copyFileSync, existsSync } from "node:fs";
import type { AppConfig } from "../config/default-config.js";
import type { Wallpaper } from "../domain/wallpaper.js";
import { groupByMonth } from "../domain/archive.js";
import { getLatestWallpapers, getWallpapersByRegion, sortByDateDesc } from "../storage/wallpaper-store.js";
import { ensureDir, writeJsonFile, writeTextFile } from "../utils/file-utils.js";
import { renderTemplate } from "./template-engine.js";
import {
  buildIndexContext,
  buildMonthContext,
  buildDetailContext,
} from "./page-context.js";
import { buildReadmeContent } from "./markdown-builder.js";
import { BROWSER_LANG_MAP, REGION_LABELS } from "../config/ui-locales.js";

export interface BuildResult {
  totalPages: number;
  totalJson: number;
  readmeUpdated: boolean;
}

export function buildSite(config: AppConfig, wallpapers: Wallpaper[]): BuildResult {
  const sorted = sortByDateDesc(wallpapers);
  const outputDir = resolve(config.site.outputDir);

  ensureDir(outputDir);

  let totalPages = 0;
  let totalJson = 0;

  // 按地区独立生成页面
  for (const region of config.bing.regions) {
    const regionWallpapers = getWallpapersByRegion(sorted, region);
    const regionOutputDir = resolve(outputDir, region);
    ensureDir(regionOutputDir);

    totalPages += buildRegionIndexPage(config, regionWallpapers, regionOutputDir, region);
    totalPages += buildRegionMonthPages(config, regionWallpapers, regionOutputDir, region);
    totalPages += buildRegionDetailPages(config, regionWallpapers, regionOutputDir, region);
    totalJson += buildRegionJsonFiles(regionWallpapers, regionOutputDir, region);
    totalJson += buildRegionApiJsonFiles(regionWallpapers, outputDir, region);
  }

  // 全局首页（语言自动跳转）
  totalPages += buildGlobalIndexPage(config, outputDir);

  // 全局 JSON（聚合所有地区）
  totalJson += buildGlobalJsonFiles(sorted, outputDir);

  // 复制静态资源
  copyStaticAssets(config, outputDir);

  // 生成 README
  const readmeUpdated = buildReadme(config, sorted);

  return { totalPages, totalJson, readmeUpdated };
}

function buildRegionIndexPage(
  config: AppConfig,
  wallpapers: Wallpaper[],
  outputDir: string,
  region: string
): number {
  const context = buildIndexContext(config, wallpapers, region);
  const html = renderTemplate("index.njk", context as unknown as Record<string, unknown>);
  writeTextFile(resolve(outputDir, "index.html"), html);
  return 1;
}

function buildRegionMonthPages(
  config: AppConfig,
  wallpapers: Wallpaper[],
  outputDir: string,
  region: string
): number {
  const groups = groupByMonth(wallpapers);
  const allKeys = groups.map((g) => g.key);
  let count = 0;

  for (const group of groups) {
    const monthDir = resolve(outputDir, "months");
    ensureDir(monthDir);

    const context = buildMonthContext(config, region, group.key, group.wallpapers, allKeys);
    const html = renderTemplate("month.njk", context as unknown as Record<string, unknown>);
    writeTextFile(resolve(monthDir, `${group.key}.html`), html);
    count++;
  }

  return count;
}

function buildRegionDetailPages(
  config: AppConfig,
  wallpapers: Wallpaper[],
  outputDir: string,
  region: string
): number {
  let count = 0;

  for (let i = 0; i < wallpapers.length; i++) {
    const wp = wallpapers[i];
    if (!wp) continue;

    const year = wp.date.slice(0, 4);
    const month = wp.date.slice(5, 7);
    const dayDir = resolve(outputDir, "days", year, month);
    ensureDir(dayDir);

    const prevDate = wallpapers[i + 1]?.date ?? null;
    const nextDate = wallpapers[i - 1]?.date ?? null;

    const context = buildDetailContext(config, region, wp, { prev: prevDate, next: nextDate });
    const html = renderTemplate("detail.njk", context as unknown as Record<string, unknown>);
    writeTextFile(resolve(dayDir, `${wp.date.slice(8, 10)}.html`), html);
    count++;
  }

  return count;
}

function buildRegionJsonFiles(
  wallpapers: Wallpaper[],
  outputDir: string,
  _region: string
): number {
  const todayWp: Wallpaper | null = wallpapers[0] ?? null;

  writeJsonFile(resolve(outputDir, "wallpapers.json"), wallpapers);
  writeJsonFile(resolve(outputDir, "today.json"), todayWp ?? {});

  return 2;
}

function buildRegionApiJsonFiles(
  wallpapers: Wallpaper[],
  siteOutputDir: string,
  region: string
): number {
  const todayWp: Wallpaper | null = wallpapers[0] ?? null;
  const apiDir = resolve(siteOutputDir, "api", region);
  ensureDir(apiDir);

  writeJsonFile(resolve(apiDir, "wallpapers.json"), wallpapers);
  writeJsonFile(resolve(apiDir, "today.json"), todayWp ?? {});

  return 2;
}

function buildGlobalJsonFiles(wallpapers: Wallpaper[], outputDir: string): number {
  const todayWp: Wallpaper | null = wallpapers[0] ?? null;

  writeJsonFile(resolve(outputDir, "api", "wallpapers.json"), wallpapers);
  writeJsonFile(resolve(outputDir, "api", "today.json"), todayWp ?? {});

  return 2;
}

/**
 * 生成全局首页：根据浏览器语言自动跳转到对应地区页
 */
function buildGlobalIndexPage(config: AppConfig, outputDir: string): number {
  const regions = config.bing.regions;
  const regionJson = JSON.stringify(regions);
  const langMapJson = JSON.stringify(BROWSER_LANG_MAP);
  const labelsJson = JSON.stringify(REGION_LABELS);
  const defaultRegion = regions.includes("en-US") ? "en-US" : (regions[0] ?? "en-US");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.site.title}</title>
  <meta name="description" content="${config.site.description}">
  <link rel="stylesheet" href="/assets/app.css">
  <style>
    .lang-redirect { display:flex; flex-direction:column; align-items:center; justify-content:center;
      min-height:80vh; text-align:center; font-family:system-ui,sans-serif; }
    .lang-redirect h1 { font-size:1.4rem; margin-bottom:1rem; }
    .lang-redirect .region-list { display:flex; flex-wrap:wrap; gap:0.6rem; justify-content:center; margin-top:1rem; }
    .lang-redirect .region-list a { padding:0.5rem 1rem; border:1px solid #d1d5db; border-radius:8px;
      text-decoration:none; color:#374151; transition:all 0.15s; }
    .lang-redirect .region-list a:hover { background:#3b82f6; color:#fff; border-color:#3b82f6; }
  </style>
</head>
<body>
  <div class="lang-redirect">
    <h1>${config.site.title}</h1>
    <p id="redirect-msg">Detecting your language...</p>
    <p>Or choose your region:</p>
    <div class="region-list" id="region-list"></div>
  </div>
  <script>
    (function(){
      var regions = ${regionJson};
      var langMap = ${langMapJson};
      var labels = ${labelsJson};
      var defaultRegion = "${defaultRegion}";

      // 渲染地区列表
      var list = document.getElementById("region-list");
      for (var i = 0; i < regions.length; i++) {
        var r = regions[i];
        var a = document.createElement("a");
        a.href = "/" + r + "/";
        a.textContent = labels[r] || r;
        list.appendChild(a);
      }

      // 尝试从 localStorage 读取上次选择
      var saved = localStorage.getItem("region");
      if (saved && regions.indexOf(saved) !== -1) {
        window.location.replace("/" + saved + "/");
        return;
      }

      // 匹配浏览器语言
      var browserLangs = navigator.languages || [navigator.language || navigator.userLanguage || ""];
      for (var j = 0; j < browserLangs.length; j++) {
        var lang = browserLangs[j].toLowerCase();
        // 精确匹配
        if (langMap[lang] && regions.indexOf(langMap[lang]) !== -1) {
          localStorage.setItem("region", langMap[lang]);
          window.location.replace("/" + langMap[lang] + "/");
          return;
        }
        // 前缀匹配（如 zh-tw → zh）
        var prefix = lang.split("-")[0];
        if (langMap[prefix] && regions.indexOf(langMap[prefix]) !== -1) {
          localStorage.setItem("region", langMap[prefix]);
          window.location.replace("/" + langMap[prefix] + "/");
          return;
        }
      }

      // 无法匹配，跳转默认地区
      document.getElementById("redirect-msg").textContent = "Redirecting to " + (labels[defaultRegion] || defaultRegion) + "...";
      localStorage.setItem("region", defaultRegion);
      setTimeout(function(){ window.location.replace("/" + defaultRegion + "/"); }, 800);
    })();
  </script>
</body>
</html>`;

  writeTextFile(resolve(outputDir, "index.html"), html);
  return 1;
}

function copyStaticAssets(config: AppConfig, outputDir: string): void {
  const publicDir = resolve(config.site.publicDir);
  const assetsDir = resolve(publicDir, "assets");
  const outputAssetsDir = resolve(outputDir, "assets");
  ensureDir(outputAssetsDir);

  const files = ["app.css", "app.js"];
  for (const file of files) {
    const src = resolve(assetsDir, file);
    const dest = resolve(outputAssetsDir, file);
    if (existsSync(src)) {
      copyFileSync(src, dest);
    }
  }
}

function buildReadme(config: AppConfig, wallpapers: Wallpaper[]): boolean {
  const latest = getLatestWallpapers(wallpapers, 10);
  const todayWp: Wallpaper | null = wallpapers[0] ?? null;
  const regions = [...new Set(wallpapers.map((wp) => wp.region))].sort();
  const months = groupByMonth(wallpapers);

  const content = buildReadmeContent({
    title: config.site.title,
    description: config.site.description,
    today: todayWp,
    recentWallpapers: latest,
    regions,
    monthCount: months.length,
  });

  writeTextFile(resolve("README.md"), content);
  return true;
}
