import { AssertionError } from "../error/AssertionError.js";

/** Absolute path starts with `/` slash. */
export type AbsolutePath = `/` | `/${string}`;

/** Relative path starts with `./` or `../` */
export type RelativePath = `.` | `./${string}` | `..` | `../${string}`;

/** Absolute path or relative path. */
export type Path = AbsolutePath | RelativePath;

/** Is a string path an absolute path? */
export const isAbsolutePath = (path: string): path is AbsolutePath => path.startsWith("/");

/** Is a string path an absolute path? */
export const isRelativePath = (path: string): path is RelativePath => path.startsWith("./") || path.startsWith("../");

/**
 * Clean a path.
 * - Runs of `//` two or more slashes are normalised to `/` single slash, e.g. `/a//b` becomes `/a/b`
 * - `\` Windows slashes are nromalised to `/` UNIX slashes.
 * - Trailing slashes are removed, e.g. `/a/b/` becomes `/a/b`
 */
export function cleanPath(path: AbsolutePath): AbsolutePath;
export function cleanPath(path: string): string;
export function cleanPath(path: string): string {
	return path
		.replace(/[/\\]+/g, "/") // Normalise slashes.
		.replace(/(?!^)\/$/g, ""); // Trailing slashes.
}

/**
 * Resolve an absolute path.
 * - Uses `new URL` to do path processing, so URL strings e.g.
 * - Returned paths are cleaned with `cleanPath()` so runs of slashes and trailing slashes are removed.
 *
 * @param path Absolute path e.g. `/a/b/c`, relative path e.g. `./a` or `b` or `../c`, URL string e.g. `http://shax.com/a/b/c`, or `URL` instance.
 * @param base Absolute path or `URL` instance used for resolving relative paths in `path`
 * @return Absolute path with a leading trailing slash, e.g. `/a/c/b`
 */
export function getPath(path: string | URL, base: AbsolutePath | URL | Location = _LOCATION): AbsolutePath {
	try {
		return cleanPath(new URL(path, `http://j.com${typeof base === "string" ? base : base.pathname}/`).pathname as AbsolutePath);
	} catch {
		throw new AssertionError("Invalid path", path);
	}
}
const _LOCATION = typeof window === "object" ? window.location : "/";

/** Is a target path active? */
export function isPathActive(target: AbsolutePath, current: AbsolutePath): boolean {
	return target === current;
}

/** Is a target path proud (i.e. is the current path, or is a child of the current path)? */
export function isPathProud(target: AbsolutePath, current: AbsolutePath): boolean {
	return target === current || (target !== "/" && target.startsWith(`${current}/`));
}
