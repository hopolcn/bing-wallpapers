import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

export function ensureDir(dirPath: string): void {
  const resolved = resolve(dirPath);
  if (!existsSync(resolved)) {
    mkdirSync(resolved, { recursive: true });
  }
}

export function readJsonFile<T>(filePath: string): T | null {
  const resolved = resolve(filePath);
  if (!existsSync(resolved)) {
    return null;
  }
  const content = readFileSync(resolved, "utf-8");
  return JSON.parse(content) as T;
}

export function writeJsonFile(filePath: string, data: unknown): void {
  const resolved = resolve(filePath);
  ensureDir(dirname(resolved));
  const content = JSON.stringify(data, null, 2);
  writeFileSync(resolved, `${content}\n`, "utf-8");
}

export function writeTextFile(filePath: string, content: string): void {
  const resolved = resolve(filePath);
  ensureDir(dirname(resolved));
  writeFileSync(resolved, content, "utf-8");
}

export function readTextFile(filePath: string): string | null {
  const resolved = resolve(filePath);
  if (!existsSync(resolved)) {
    return null;
  }
  return readFileSync(resolved, "utf-8");
}
