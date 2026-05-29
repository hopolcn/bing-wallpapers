import { execSync } from "node:child_process";

export interface AutoCommitOptions {
  message: string;
  paths: string[];
  authorName: string;
  authorEmail: string;
}

const DEFAULT_OPTIONS: AutoCommitOptions = {
  message: "chore: update wallpaper archive",
  paths: ["README.md", "data", "site"],
  authorName: "github-actions[bot]",
  authorEmail: "41898282+github-actions[bot]@users.noreply.github.com",
};

/**
 * 检查工作区是否有文件变更
 */
export function hasChanges(): boolean {
  try {
    const output = execSync("git status --porcelain", { encoding: "utf-8" });
    return output.trim().length > 0;
  } catch {
    return false;
  }
}

/**
 * 自动提交并推送变更
 * 仅在有文件变更时执行，避免空提交
 */
export function autoCommit(options: Partial<AutoCommitOptions> = {}): boolean {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!hasChanges()) {
    console.log("没有文件变更，跳过提交。");
    return false;
  }

  try {
    // 配置 Git 身份
    execSync(`git config user.name "${opts.authorName}"`, { encoding: "utf-8" });
    execSync(`git config user.email "${opts.authorEmail}"`, { encoding: "utf-8" });

    // 暂存文件
    for (const path of opts.paths) {
      try {
        execSync(`git add ${path}`, { encoding: "utf-8" });
      } catch {
        // 路径不存在时忽略
      }
    }

    // 检查暂存区是否有内容
    const staged = execSync("git diff --cached --name-only", { encoding: "utf-8" });
    if (staged.trim().length === 0) {
      console.log("暂存区为空，跳过提交。");
      return false;
    }

    // 提交
    execSync(`git commit -m "${opts.message}"`, { encoding: "utf-8" });
    console.log("已提交变更。");

    // 推送
    execSync("git push", { encoding: "utf-8" });
    console.log("已推送到远程仓库。");

    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("自动提交失败:", message);
    return false;
  }
}
