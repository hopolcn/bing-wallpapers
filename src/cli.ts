#!/usr/bin/env node

import { runCli } from "./cli/index.js";

runCli(process.argv.slice(2)).catch((error: unknown) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
