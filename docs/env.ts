import { resolve } from "node:path";
import { requireBaseURL } from "../modules/util/index.js";
import type { AbsolutePath } from "../modules/util/path.js";

export const DOCS_DIR = resolve(import.meta.dir) as AbsolutePath;
export const ROOT_DIR = resolve(DOCS_DIR, "..") as AbsolutePath;
export const MODULES_DIR = resolve(ROOT_DIR, "modules") as AbsolutePath;
export const OUTPUT_DIR = resolve(ROOT_DIR, ".build/docs") as AbsolutePath;

export const APP_TITLE = "Shelving";
export const APP_DESCRIPTION = "TypeScript data toolkit";
export const APP_LANGUAGE = "en";
// `APP_URL` is the site root, reused as the base for every page and asset URL. `requireURL()` would
// normalise it to a trailing slash on each call anyway, so `requireBaseURL` changes no behaviour — it
// is a semantic marker ("this is a base URL") plus a marginal efficiency win (the slash is added once).
export const APP_URL = requireBaseURL(process.env.APP_URL ?? "http://localhost:3456", requireBaseURL);
