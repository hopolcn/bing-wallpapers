import nunjucks from "nunjucks";
import { resolve } from "node:path";

let env: nunjucks.Environment | null = null;

export function getTemplateEngine(): nunjucks.Environment {
  if (!env) {
    const templatesDir = resolve("templates");
    env = new nunjucks.Environment(
      new nunjucks.FileSystemLoader(templatesDir, {
        noCache: true,
      }),
      {
        autoescape: true,
        throwOnUndefined: false,
        trimBlocks: true,
        lstripBlocks: true,
      }
    );
  }
  return env;
}

export function renderTemplate(templateName: string, context: Record<string, unknown>): string {
  const engine = getTemplateEngine();
  return engine.render(templateName, context);
}
