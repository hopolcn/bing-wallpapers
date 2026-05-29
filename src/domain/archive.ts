import type { Wallpaper } from "./wallpaper.js";

export interface MonthGroup {
  key: string;
  year: number;
  month: number;
  wallpapers: Wallpaper[];
}

export function groupByMonth(wallpapers: Wallpaper[]): MonthGroup[] {
  const map = new Map<string, Wallpaper[]>();

  for (const wp of wallpapers) {
    const year = Number.parseInt(wp.date.slice(0, 4), 10);
    const month = Number.parseInt(wp.date.slice(5, 7), 10);
    const key = `${year}-${String(month).padStart(2, "0")}`;
    const group = map.get(key);
    if (group) {
      group.push(wp);
    } else {
      map.set(key, [wp]);
    }
  }

  const groups: MonthGroup[] = [];
  for (const [key, wps] of map) {
    const year = Number.parseInt(key.slice(0, 4), 10);
    const month = Number.parseInt(key.slice(5, 7), 10);
    groups.push({ key, year, month, wallpapers: wps });
  }

  return groups.sort((a, b) => b.key.localeCompare(a.key));
}
