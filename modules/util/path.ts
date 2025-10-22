import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";
import type { Nullish } from "./null.js";
import { getURL } from "./url.js";

/** Absolute path string starts with `/` slash. */
export type AbsolutePath = `/` | `/${string}`;

/** Relative path string starts with `./` or `../` */
export type RelativePath = `.` | `./${string}` | `..` | `../${string}`;

/** Either an absolute path string or a relative path string. */
export type Path = AbsolutePath | RelativePath;

/** Is a string path an absolute path? */
export function isAbsolutePath(path: string): path is AbsolutePath {
	return path.startsWith("/");
}

/** Is a string path an absolute path? */
export function isRelativePath(path: string): path is RelativePath {
	return path.startsWith("./") || path.startsWith("../");
}

/**
 * Clean a path.
 * - Runs of `//` two or more slashes are normalised to `/` single slash, e.g. `/a//b` becomes `/a/b`
 * - `\` Windows slashes are nromalised to `/` UNIX slashes.
 * - Trailing slashes are removed, e.g. `/a/b/` becomes `/a/b`
 */
function _cleanPath(path: AbsolutePath): AbsolutePath;
function _cleanPath(path: string): string;
function _cleanPath(path: string): string {
	return path
		.replace(/[/\\]+/g, "/") // Normalise slashes.
		.replace(/(?!^)\/$/g, ""); // Trim trailing slashes.
}

/**
 * Resolve a relative or absolute path and return the absolute path, or `undefined` if not a valid path.
 * - Uses `new URL` to do path processing, so URL strings can also be resolved.
 * - Returned paths are cleaned with `cleanPath()` so runs of slashes and trailing slashes are removed.
 *
 * @param value Absolute path e.g. `/a/b/c`, relative path e.g. `./a` or `b` or `../c`, URL string e.g. `http://shax.com/a/b/c`, or `URL` instance.
 * @param base Absolute path used for resolving relative paths in `possible`
 * @return Absolute path with a leading trailing slash, e.g. `/a/c/b`
 */
export function getPath(value: Nullish<string | URL>, base?: AbsolutePath): AbsolutePath | undefined {
	const url = getURL(value, base ? `http://j.com${base}${base.endsWith("/") ? "" : "/"}` : "http://j.com");
	if (url) {
		const { pathname, search, hash } = url;
		if (isAbsolutePath(pathname)) return `${_cleanPath(pathname)}${search}${hash}`;
	}
}

/**
 * Resolve a relative or absolute path and return the path, or throw `RequiredError` if not a valid path.
 * - Internally uses `new URL` to do path processing but shouldn't ever reveal that fact.
 * - Returned paths are cleaned with `cleanPath()` so runs of slashes and trailing slashes are removed.
 *
 * @param value Absolute path e.g. `/a/b/c`, relative path e.g. `./a` or `b` or `../c`, URL string e.g. `http://shax.com/a/b/c`, or `URL` instance.
 * @param base Absolute path used for resolving relative paths in `possible`
 * @return Absolute path with a leading trailing slash, e.g. `/a/c/b`
 */
export function requirePath(value: string | URL, base?: AbsolutePath, caller: AnyCaller = requirePath): AbsolutePath {
	const path = getPath(value, base);
	if (!path) throw new RequiredError("Invalid URL", { received: value, caller });
	return path;
}

/** Is a target path active? */
export function isPathActive(target: AbsolutePath, current: AbsolutePath): boolean {
	return target === current;
}

/** Is a target path proud (i.e. is the current path, or is a child of the current path)? */
export function isPathProud(target: AbsolutePath, current: AbsolutePath): boolean {
	return target === current || (target !== "/" && target.startsWith(`${current}/`));
}
