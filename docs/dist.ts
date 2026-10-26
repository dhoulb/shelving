/**
 * Write the Markdown docs into `dist/docs` for the npm package.
 *
 * Run by `bun run build` (see `package.json`). Coding agents read these files from `node_modules/shelving/docs/`, so the docs always match the installed version.
 */

import { resolve } from "node:path";
import type { AbsolutePath } from "../modules/util/path.js";
import { MODULES_DIR, PACKAGE_JSON_PATH, ROOT_DIR } from "./env.js";
import { renderMarkdown } from "./markdown.js";
import { extractTree } from "./tree.js";

const DIST_DOCS_DIR = resolve(ROOT_DIR, "dist/docs") as AbsolutePath;

const count = await renderMarkdown(await extractTree(MODULES_DIR, PACKAGE_JSON_PATH), DIST_DOCS_DIR);
console.warn(`Wrote ${count} Markdown pages → ${DIST_DOCS_DIR}`);
