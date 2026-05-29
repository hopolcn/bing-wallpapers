import type { AppConfig } from "../config/default-config.js";
import type { Wallpaper } from "../domain/wallpaper.js";
import { groupByMonth } from "../domain/archive.js";
import { getLatestWallpapers } from "../storage/wallpaper-store.js";
import { type UiLocale, REGION_LABELS, getUiText } from "../config/ui-locales.js";

export interface PageContext {
  siteTitle: string;
  siteDescription: string;
  baseUrl: string;
  lang: string;
  pageTitle: string;
  pageDescription: string;
  ogImage?: string;
  recentMonths: Array<{ key: string; label: string }>;
  region: string;
  uiText: UiLocale;
  availableRegions: string[];
  regionLabels: Record<string, string>;
}

export function buildPageContext(
  config: AppConfig,
  region: string,
  pageTitle: string,
  pageDescription: string,
  ogImage?: string
): PageContext {
  return {
    siteTitle: config.site.title,
    siteDescription: config.site.description,
    baseUrl: config.site.baseUrl,
    lang: region,
    pageTitle,
    pageDescription,
    ogImage,
    recentMonths: [],
    region,
    uiText: getUiText(region),
    availableRegions: config.bing.regions,
    regionLabels: REGION_LABELS,
  };
}

export interface IndexContext extends PageContext {
  todayWallpaper: Wallpaper | null;
  wallpapers: Wallpaper[];
  regions: string[];
  months: Array<{ key: string; count: number }>;
}

export function buildIndexContext(
  config: AppConfig,
  regionWallpapers: Wallpaper[],
  region: string
): IndexContext {
  const latest = getLatestWallpapers(regionWallpapers, config.archive.latestLimit);
  const todayWp: Wallpaper | null = regionWallpapers[0] ?? null;
  const months = groupByMonth(regionWallpapers).map((g) => ({
    key: g.key,
    count: g.wallpapers.length,
  }));
  const regions = [...new Set(regionWallpapers.map((wp) => wp.region))].sort();

  return {
    ...buildPageContext(config, region, getUiText(region).latestWallpapers, config.site.description, todayWp?.imageUrl),
    todayWallpaper: todayWp,
    wallpapers: latest,
    regions,
    months,
    recentMonths: months.slice(0, 6).map((m) => ({
      key: m.key,
      label: m.key,
    })),
  };
}

export interface MonthContext extends PageContext {
  monthKey: string;
  wallpapers: Wallpaper[];
  wallpaperCount: number;
  prevMonth: string | null;
  nextMonth: string | null;
}

export function buildMonthContext(
  config: AppConfig,
  region: string,
  monthKey: string,
  monthWallpapers: Wallpaper[],
  allMonthKeys: string[]
): MonthContext {
  const idx = allMonthKeys.indexOf(monthKey);
  const uiText = getUiText(region);

  return {
    ...buildPageContext(config, region, `${monthKey} ${uiText.monthlyArchive}`, `${monthKey} Bing Wallpaper Archive`),
    monthKey,
    wallpapers: monthWallpapers,
    wallpaperCount: monthWallpapers.length,
    prevMonth: idx < allMonthKeys.length - 1 ? (allMonthKeys[idx + 1] ?? null) : null,
    nextMonth: idx > 0 ? (allMonthKeys[idx - 1] ?? null) : null,
    recentMonths: allMonthKeys.slice(0, 6).map((k) => ({ key: k, label: k })),
  };
}

export interface DetailContext extends PageContext {
  wallpaper: Wallpaper;
  monthKey: string;
  prevDay: string | null;
  nextDay: string | null;
}

export function buildDetailContext(
  config: AppConfig,
  region: string,
  wallpaper: Wallpaper,
  adjacentDates: { prev: string | null; next: string | null }
): DetailContext {
  return {
    ...buildPageContext(
      config,
      region,
      wallpaper.title,
      wallpaper.copyright,
      wallpaper.imageUrl
    ),
    wallpaper,
    monthKey: wallpaper.date.slice(0, 7),
    prevDay: adjacentDates.prev,
    nextDay: adjacentDates.next,
    recentMonths: [],
  };
}
