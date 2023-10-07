import { AssertionError } from "../error/AssertionError.js";

/** Relative path starts with `./` or `../` */
export type RelativePath = `./${string}` | `../${string}`;

/** Absolute path starts with `/` slash. */
export type AbsolutePath = `/${string}`;

/** Path is either an absolute or relative path. */
export type Path = AbsolutePath | RelativePath;

/** Is a string path an absolute path? */
export const isAbsolutePath = (path: string): path is AbsolutePath => path.startsWith("/");

/** Is a string path an absolute path? */
export const isRelativePath = (path: string): path is RelativePath => path.startsWith("./") || path.startsWith("../");

/**
 * Clean a path.
 * - Remove runs of more than one slash, e.g. `/a//b` becomes `/a/b`
 * - Remove trailing slashes, e.g. `/a/b/` becomes `/a/b`
 */
export function cleanPath(path: AbsolutePath): AbsolutePath;
export function cleanPath(path: string): string;
export function cleanPath(path: string): string {
	return path
		.replace(/\/{2,}/g, "/") // Normalise runs of two or more slashes.
		.replace(/(?!^)\/+$/g, ""); // Trailing slashes.
}

/**
 * Get an absolute path.
 * @return Absolute path with a leading trailing slash, e.g. `/a/c/b`
 */
export function getAbsolutePath(path: Path, base: AbsolutePath = "/"): AbsolutePath {
	try {
		return cleanPath(new URL(path, `http://j.com${base}/`).pathname as AbsolutePath);
	} catch {
		throw new AssertionError("Invalid path", path);
	}
}

/** Is a target path active? */
export function isPathActive(target: AbsolutePath, current: AbsolutePath): boolean {
	return target === current;
}

/** Is a target path proud (i.e. is the current path, or is a child of the current path)? */
export function isPathProud(target: AbsolutePath, current: AbsolutePath): boolean {
	return target === current || (target !== "/" && target.startsWith(`${current}/`));
}
