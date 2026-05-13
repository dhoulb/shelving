/**
 * Static documentation site builder.
 *
 * Extracts tree elements from `modules/` and renders every page to static HTML in `.build/docs/`.
 *
 * Run with `bun run docs:build` (see `package.json`).
 */

import { buildApp } from "./app";
import { MODULES_DIR, OUTPUT_DIR } from "./env.js";

await buildApp(MODULES_DIR, OUTPUT_DIR);
