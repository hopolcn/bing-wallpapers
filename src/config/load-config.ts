import { type AppConfig, defaultConfig } from "./default-config.js";

export function loadConfig(): AppConfig {
  const env = process.env;

  const config: AppConfig = {
    ...defaultConfig,
    site: {
      ...defaultConfig.site,
      baseUrl: env.SITE_BASE_URL ?? defaultConfig.site.baseUrl,
    },
    bing: {
      ...defaultConfig.bing,
      regions: env.BING_REGIONS
        ? env.BING_REGIONS.split(",").map((r) => r.trim())
        : defaultConfig.bing.regions,
    },
    archive: {
      ...defaultConfig.archive,
      latestLimit: env.LATEST_LIMIT
        ? Number.parseInt(env.LATEST_LIMIT, 10)
        : defaultConfig.archive.latestLimit,
    },
    git: {
      ...defaultConfig.git,
      autoCommit: env.AUTO_COMMIT === "true",
    },
  };

  return config;
}
