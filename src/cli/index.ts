import { loadConfig } from "../config/load-config.js";
import { fetchAllRegions } from "../bing/bing-client.js";
import { normalizeBingImages } from "../bing/normalize-bing-image.js";
import {
  loadWallpapers,
  mergeWallpapers,
  saveWallpapers,
  saveRegionFiles,
} from "../storage/wallpaper-store.js";
import { buildSite } from "../render/site-builder.js";

type CommandHandler = () => Promise<void>;

const commands: Record<string, CommandHandler> = {
  update: async () => {
    const config = loadConfig();
    console.log("=== 开始更新壁纸数据 ===");
    console.log(`市场区域: ${config.bing.regions.join(", ")}`);

    // 1. 获取 Bing 数据
    const results = await fetchAllRegions(config);

    // 2. 规范化数据
    let allNew = [];
    for (const result of results) {
      if (result.images.length > 0) {
        const normalized = normalizeBingImages(result.images, result.region);
        allNew.push(...normalized);
      }
    }
    console.log(`本次获取: ${allNew.length} 张壁纸`);

    // 3. 合并去重
    const existing = loadWallpapers();
    const merged = mergeWallpapers(existing, allNew);
    console.log(`合并后总计: ${merged.length} 张壁纸 (原有 ${existing.length})`);

    // 4. 保存数据
    saveWallpapers(merged);
    saveRegionFiles(merged);
    console.log("数据已保存到 data/ 目录");

    // 5. 构建站点
    const result = buildSite(config, merged);
    console.log(`站点已构建: ${result.totalPages} 个页面, ${result.totalJson} 个 JSON`);
    console.log("=== 更新完成 ===");
  },

  build: async () => {
    const config = loadConfig();
    console.log("=== 开始构建站点 ===");

    const wallpapers = loadWallpapers();
    if (wallpapers.length === 0) {
      console.warn("警告: 没有壁纸数据，请先运行 pnpm update");
      return;
    }

    const result = buildSite(config, wallpapers);
    console.log(`站点已构建: ${result.totalPages} 个页面, ${result.totalJson} 个 JSON`);
    console.log("=== 构建完成 ===");
  },

  validate: async () => {
    console.log("=== 开始校验数据 ===");
    const wallpapers = loadWallpapers();
    console.log(`壁纸总数: ${wallpapers.length}`);

    const ids = new Set<string>();
    let duplicates = 0;
    for (const wp of wallpapers) {
      if (ids.has(wp.id)) {
        duplicates++;
      }
      ids.add(wp.id);
    }

    if (duplicates > 0) {
      console.warn(`发现 ${duplicates} 个重复 ID`);
    } else {
      console.log("无重复数据");
    }

    const regions = new Set(wallpapers.map((wp) => wp.region));
    console.log(`区域数: ${regions.size}`);
    console.log(`唯一 ID 数: ${ids.size}`);
    console.log("=== 校验完成 ===");
  },
};

export async function runCli(args: string[]): Promise<void> {
  const command = args[0];

  if (!command || command === "--help" || command === "-h") {
    console.log(`
用法: bing-wallpapers <command>

命令:
  update    获取 Bing 壁纸数据、合并存储、生成站点
  build     仅从本地数据构建站点
  validate  校验数据完整性
`);
    return;
  }

  const handler = commands[command];
  if (!handler) {
    console.error(`未知命令: ${command}`);
    process.exit(1);
  }

  await handler();
}
