import { ValueError } from "../error/ValueError.js";
import { type Optional, notOptional } from "./optional.js";

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
		.replace(/(?!^)\/$/g, ""); // Trailing slashes.
}

/**
 * Resolve a relative or absolute path and return the path, or `undefined` if not a valid path.
 * - Uses `new URL` to do path processing, so URL strings e.g.
 * - Returned paths are cleaned with `cleanPath()` so runs of slashes and trailing slashes are removed.
 *
 * @param possible Absolute path e.g. `/a/b/c`, relative path e.g. `./a` or `b` or `../c`, URL string e.g. `http://shax.com/a/b/c`, or `URL` instance.
 * @param base Absolute path used for resolving relative paths in `possible`
 * @return Absolute path with a leading trailing slash, e.g. `/a/c/b`
 */
export function getOptionalPath(possible: Optional<string | URL>, base: AbsolutePath | undefined = "/"): AbsolutePath | undefined {
	if (notOptional(possible)) {
		try {
			const { pathname, search, hash } = new URL(possible, `http://j.com${base}/`);
			if (isAbsolutePath(pathname)) return `${_cleanPath(pathname)}${search}${hash}`;
		} catch {
			//
		}
	}
}

/**
 * Resolve a relative or absolute path and return the path, or throw `ValueError` if not a valid path.
 * - Internally uses `new URL` to do path processing but shouldn't ever reveal that fact.
 * - Returned paths are cleaned with `cleanPath()` so runs of slashes and trailing slashes are removed.
 *
 * @param possible Absolute path e.g. `/a/b/c`, relative path e.g. `./a` or `b` or `../c`, URL string e.g. `http://shax.com/a/b/c`, or `URL` instance.
 * @param base Absolute path used for resolving relative paths in `possible`
 * @return Absolute path with a leading trailing slash, e.g. `/a/c/b`
 */
export function getPath(possible: string, base?: AbsolutePath): AbsolutePath {
	const path = getOptionalPath(possible, base);
	if (!path) throw new ValueError("Invalid URL", possible);
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
