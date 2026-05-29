import { describe, expect, it } from "vitest";
import {
  formatDate,
  getMonthKey,
  parseDate,
  today,
} from "../src/utils/date-utils.js";

describe("日期工具函数", () => {
  it("formatDate 应格式化日期为 YYYY-MM-DD", () => {
    const date = new Date(2026, 4, 29);
    expect(formatDate(date)).toBe("2026-05-29");
  });

  it("parseDate 应解析日期字符串", () => {
    const date = parseDate("2026-05-29");
    expect(date.getUTCFullYear()).toBe(2026);
    expect(date.getUTCMonth()).toBe(4);
    expect(date.getUTCDate()).toBe(29);
  });

  it("getMonthKey 应提取年月", () => {
    expect(getMonthKey("2026-05-29")).toBe("2026-05");
  });

  it("today 应返回当天日期字符串", () => {
    const result = today();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
