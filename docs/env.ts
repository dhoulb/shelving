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
// `APP_URL` is the site root, so it must end in `/` — otherwise the `<base href>` tag and
// site-root-relative links resolve against its parent directory and drop the final path
// segment (e.g. the `/pr-<number>/` preview subfolder). `requireBaseURL` guarantees the slash.
export const APP_URL = requireBaseURL(process.env.APP_URL ?? "http://localhost:3456", requireBaseURL);
