import { resolve } from "node:path";
import type { Wallpaper } from "../domain/wallpaper.js";
import { readJsonFile, writeJsonFile } from "../utils/file-utils.js";

const WALLPAPERS_FILE = "data/wallpapers.json";
const REGIONS_DIR = "data/regions";

/**
 * 读取已存储的所有壁纸数据
 */
export function loadWallpapers(): Wallpaper[] {
  const data = readJsonFile<Wallpaper[]>(WALLPAPERS_FILE);
  return data ?? [];
}

/**
 * 保存壁纸数据到主文件
 */
export function saveWallpapers(wallpapers: Wallpaper[]): void {
  const sorted = sortByDateDesc(wallpapers);
  writeJsonFile(WALLPAPERS_FILE, sorted);
}

/**
 * 合并新数据到已有数据，按 ID 去重
 * 已存在的记录更新 updatedAt 和可变字段
 */
export function mergeWallpapers(existing: Wallpaper[], incoming: Wallpaper[]): Wallpaper[] {
  const map = new Map<string, Wallpaper>();

  for (const wp of existing) {
    map.set(wp.id, wp);
  }

  for (const wp of incoming) {
    const current = map.get(wp.id);
    if (current) {
      // 已存在则更新可变字段
      map.set(wp.id, {
        ...current,
        title: wp.title,
        copyright: wp.copyright,
        copyrightLink: wp.copyrightLink,
        imageUrl: wp.imageUrl,
        downloadUrl: wp.downloadUrl,
        thumbnailUrl: wp.thumbnailUrl,
        sourceUrl: wp.sourceUrl,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // 新数据直接添加
      map.set(wp.id, wp);
    }
  }

  return Array.from(map.values());
}

/**
 * 按日期倒序排序
 */
export function sortByDateDesc(wallpapers: Wallpaper[]): Wallpaper[] {
  return [...wallpapers].sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * 按地区拆分并保存
 */
export function saveRegionFiles(wallpapers: Wallpaper[]): void {
  const regionMap = new Map<string, Wallpaper[]>();

  for (const wp of wallpapers) {
    const list = regionMap.get(wp.region);
    if (list) {
      list.push(wp);
    } else {
      regionMap.set(wp.region, [wp]);
    }
  }

  for (const [region, wps] of regionMap) {
    const filePath = resolve(REGIONS_DIR, `${region}.json`);
    const sorted = sortByDateDesc(wps);
    writeJsonFile(filePath, sorted);
  }
}

/**
 * 获取最新 N 张壁纸
 */
export function getLatestWallpapers(wallpapers: Wallpaper[], limit: number): Wallpaper[] {
  const sorted = sortByDateDesc(wallpapers);
  return sorted.slice(0, limit);
}

/**
 * 获取指定月份的壁纸
 */
export function getWallpapersByMonth(wallpapers: Wallpaper[], monthKey: string): Wallpaper[] {
  return wallpapers.filter((wp) => wp.date.startsWith(monthKey));
}

/**
 * 获取指定地区的壁纸
 */
export function getWallpapersByRegion(wallpapers: Wallpaper[], region: string): Wallpaper[] {
  return wallpapers.filter((wp) => wp.region === region);
}

/**
 * 获取去重统计
 */
export function getDedupStats(before: number, after: number): { added: number; updated: number } {
  const added = after - before;
  return {
    added: Math.max(0, added),
    updated: Math.max(0, before - (after - added)),
  };
}
