import type { Wallpaper } from "../domain/wallpaper.js";
import { escapeMarkdown } from "../utils/escape-utils.js";

export interface ReadmeData {
  title: string;
  description: string;
  today: Wallpaper | null;
  recentWallpapers: Wallpaper[];
  regions: string[];
  monthCount: number;
}

export function buildReadmeContent(data: ReadmeData): string {
  const lines: string[] = [];

  lines.push(`# ${escapeMarkdown(data.title)}`);
  lines.push("");
  lines.push(data.description);
  lines.push("");

  if (data.today) {
    lines.push("## 今日壁纸");
    lines.push("");
    const alt = escapeMarkdown(data.today.title);
    lines.push(`[![${alt}](${data.today.thumbnailUrl})](${data.today.downloadUrl})`);
    lines.push("");
    lines.push(`**日期：** ${data.today.date}`);
    lines.push(`**区域：** ${data.today.region}`);
    lines.push(`**描述：** ${escapeMarkdown(data.today.copyright)}`);
    lines.push("");
  }

  if (data.recentWallpapers.length > 0) {
    lines.push("## 最新壁纸");
    lines.push("");
    lines.push("| 日期 | 区域 | 预览 | 下载 |");
    lines.push("|---|---|---|---|");
    for (const wp of data.recentWallpapers.slice(0, 10)) {
      lines.push(
        `| ${wp.date} | ${wp.region} | ![](${wp.thumbnailUrl}) | [4K](${wp.downloadUrl}) |`
      );
    }
    lines.push("");
  }

  lines.push("## 项目说明");
  lines.push("");
  lines.push(`- 支持区域：${data.regions.join(", ")}`);
  lines.push(`- 归档月份数：${data.monthCount}`);
  lines.push(`- 数据来源：Bing 每日壁纸`);
  lines.push("");

  lines.push("## 许可证");
  lines.push("");
  lines.push("[Apache License 2.0](LICENSE)");
  lines.push("");

  lines.push("## 声明");
  lines.push("");
  lines.push("本项目为独立实现。Bing 和相关商标归 Microsoft Corporation 所有。");
  lines.push("");

  return lines.join("\n");
}
