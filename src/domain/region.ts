export type Region = string;

export const SUPPORTED_REGIONS: Region[] = [
  "en-US",
  "zh-CN",
  "ja-JP",
  "de-DE",
  "fr-FR",
  "en-GB",
  "en-AU",
  "en-IN",
  "pt-BR",
  "ko-KR",
];

export function isValidRegion(region: string): boolean {
  return SUPPORTED_REGIONS.includes(region);
}
