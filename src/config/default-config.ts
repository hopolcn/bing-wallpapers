export interface AppConfig {
  site: {
    title: string;
    description: string;
    baseUrl: string;
    outputDir: string;
    publicDir: string;
  };
  bing: {
    regions: string[];
    countPerRequest: number;
    requestTimeoutMs: number;
  };
  archive: {
    latestLimit: number;
    timezone: string;
  };
  git: {
    autoCommit: boolean;
    commitMessage: string;
  };
}

export const defaultConfig: AppConfig = {
  site: {
    title: "Bing Wallpapers",
    description: "每日 Bing 壁纸自动采集与展示",
    baseUrl: "https://bing-wallpapers.vercel.app",
    outputDir: "site",
    publicDir: "public",
  },
  bing: {
    regions: ["en-US", "zh-CN", "ja-JP", "de-DE", "fr-FR"],
    countPerRequest: 8,
    requestTimeoutMs: 15000,
  },
  archive: {
    latestLimit: 30,
    timezone: "Asia/Shanghai",
  },
  git: {
    autoCommit: false,
    commitMessage: "chore: update wallpaper archive",
  },
};
