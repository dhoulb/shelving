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

/** Things that can be converted to a path. */
export type PossiblePath = string | URL;

/** Is a string path an absolute path? */
export function isAbsolutePath(path: Path): path is AbsolutePath {
	return path.startsWith("/");
}

/** Is a string path an absolute path? */
export function isRelativePath(path: Path): path is RelativePath {
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
export function getPath(value: Nullish<PossiblePath>, base?: AbsolutePath): AbsolutePath | undefined {
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
export function requirePath(value: PossiblePath, base?: AbsolutePath, caller: AnyCaller = requirePath): AbsolutePath {
	const path = getPath(value, base);
	if (!path) throw new RequiredError("Invalid path", { received: value, caller });
	return path;
}

/**
 * Match and strip a base path prefix from a path using segment-aware pathname rules.
 * - Both inputs must be absolute paths that begin with `/`.
 * - Returns `/` when the paths are an exact match.
 */
export function matchPathPrefix(target: Path, base: AbsolutePath): AbsolutePath | undefined {
	const targetPath = getPath(target, base);
	if (!targetPath) return;
	const normalBasePath = _normalizeBasePath(base);
	if (normalBasePath === "/") return targetPath;
	if (targetPath === normalBasePath) return "/";
	if (!targetPath.startsWith(`${normalBasePath}/`)) return;
	return targetPath.slice(normalBasePath.length) as AbsolutePath;
}
function _normalizeBasePath(base: AbsolutePath): AbsolutePath {
	if (base === "/") return "/";
	return (base.endsWith("/") ? base.slice(0, -1) : base) as AbsolutePath;
}

/** Is a target path active? */
export function isPathActive(target: AbsolutePath, current: AbsolutePath): boolean {
	return target === current;
}

/** Is a target path proud (i.e. is the current path, or is a child of the current path)? */
export function isPathProud(target: AbsolutePath, current: AbsolutePath): boolean {
	return target === current || (target !== "/" && target.startsWith(`${current}/`));
}
