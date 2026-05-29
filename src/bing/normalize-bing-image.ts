import type { Wallpaper } from "../domain/wallpaper.js";
import { toAbsoluteUrl } from "../utils/url-utils.js";
import type { BingImage } from "./bing-types.js";

/**
 * 将 Bing API 响应中的图片数据规范化为内部 Wallpaper 模型
 */
export function normalizeBingImage(image: BingImage, region: string): Wallpaper {
  const imageId = image.hsh || hashFromUrl(image.urlbase);
  const date = formatDateFromBing(image.startdate);
  const imageUrl = toAbsoluteUrl(image.url);
  const baseDownloadUrl = toAbsoluteUrl(image.urlbase);

  return {
    id: `${region}:${date}:${imageId}`,
    region,
    date,
    title: image.title || extractTitle(image.copyright),
    copyright: image.copyright,
    copyrightLink: image.copyrightlink || undefined,
    imageUrl,
    downloadUrl: `${baseDownloadUrl}_UHD.jpg&pid=hp&w=3840&h=2160&rs=1&c=4`,
    thumbnailUrl: `${baseDownloadUrl}_UHD.jpg&pid=hp&w=384&h=216&rs=1&c=4`,
    sourceUrl: `https://www.bing.com/search?q=${encodeURIComponent(image.title || image.copyright)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 批量规范化 Bing 图片列表
 */
export function normalizeBingImages(
  images: BingImage[],
  region: string
): Wallpaper[] {
  return images
    .filter((img) => img.url && img.startdate)
    .map((img) => normalizeBingImage(img, region));
}

/**
 * 从 Bing 日期格式 (yyyyMMdd) 转为 ISO 日期 (yyyy-MM-dd)
 */
function formatDateFromBing(bingDate: string): string {
  if (bingDate.length !== 8) {
    return bingDate;
  }
  const year = bingDate.slice(0, 4);
  const month = bingDate.slice(4, 6);
  const day = bingDate.slice(6, 8);
  return `${year}-${month}-${day}`;
}

/**
 * 从 URL base 中提取图片哈希作为备用 ID
 */
function hashFromUrl(urlBase: string): string {
  const match = urlBase.match(/id=([^&]+)/);
  return match?.[1] ?? urlBase.replace(/[^a-zA-Z0-9]/g, "").slice(0, 32);
}

/**
 * 从版权文本中提取标题
 * Bing 的 copyright 格式通常为 "描述 (© 作者)"
 */
function extractTitle(copyright: string): string {
  const parenIndex = copyright.indexOf(" (");
  if (parenIndex > 0) {
    return copyright.slice(0, parenIndex).trim();
  }
  return copyright.trim();
}
