import { resolve } from "node:path";
import { requireURL } from "../modules/util/index.js";
import type { AbsolutePath } from "../modules/util/path.js";

export const ROOT_DIR = resolve(import.meta.dir, "..") as AbsolutePath;
export const MODULES_DIR = resolve(ROOT_DIR, "modules") as AbsolutePath;
export const OUTPUT_DIR = resolve(ROOT_DIR, ".build/docs") as AbsolutePath;

export const APP_TITLE = "Shelving";
export const APP_DESCRIPTION = "TypeScript data toolkit";
export const APP_LANGUAGE = "en";
export const APP_URL = requireURL(process.env.APP_URL ?? "http://localhost:3456");
