/** Bing HPImageArchive.aspx API 响应的原始类型定义 */

export interface BingArchiveResponse {
  images: BingImage[];
  tooltips: BingTooltips;
}

export interface BingImage {
  startdate: string;
  fullstartdate: string;
  enddate: string;
  url: string;
  urlbase: string;
  copyright: string;
  copyrightlink: string;
  title: string;
  quiz: string;
  wp: boolean;
  hsh: string;
  drk: number;
  top: number;
  bot: number;
  hs: unknown[];
  cvid?: string;
}

export interface BingTooltips {
  loading: string;
  previous: string;
  next: string;
  walle: string;
  walls: string;
}
