import { describe, expect, it } from "vitest";
import { escapeHtml, escapeMarkdown } from "../src/utils/escape-utils.js";

describe("转义工具函数", () => {
  it("escapeHtml 应转义 HTML 特殊字符", () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
    );
  });

  it("escapeHtml 应转义单引号", () => {
    expect(escapeHtml("it's")).toBe("it&#39;s");
  });

  it("escapeMarkdown 应转义管道符", () => {
    expect(escapeMarkdown("a | b")).toBe("a \\| b");
  });

  it("escapeMarkdown 应将换行替换为空格", () => {
    expect(escapeMarkdown("line1\nline2")).toBe("line1 line2");
  });
});
