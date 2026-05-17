/**
 * Reuseable utilities for dealing with filesystem paths.
 */

import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";
import { isNullish, splitString } from "./index.js";
import type { Nullish } from "./null.js";

/** Absolute path string starts with `/` slash. */
export type AbsolutePath = `/` | `/${string}`;

/** Relative path string is `.` dot, or starts with `./` dot slash. */
export type RelativePath = `.` | `./` | `./${string}`;

/** Either an absolute or relative path. */
export type Path = AbsolutePath | RelativePath;

/** Things that can be converted to a path. */
export type PossiblePath = string | readonly string[];

/** Is a string path an absolute path? */
export function isAbsolutePath(path: PossiblePath): path is AbsolutePath {
	return typeof path === "string" && path.startsWith("/");
}

/** Is a string path an relative path? */
export function isRelativePath(path: PossiblePath): path is RelativePath {
	return typeof path === "string" && (path === "." || path.startsWith("./"));
}

/**
 * Resolve a relative or absolute path and return the absolute path, or `undefined` if not a valid path.
 * - Normalises runs of `//` more than one slash.
 * - Normalises `\` windows paths.
 * - Strips trailing slashes.
 *
 * @param path Absolute path e.g. `/a/b/c`, relative path e.g. `./a` or `b` or `../c`, URL string e.g. `http://shax.com/a/b/c`, or `URL` instance.
 * @param base Absolute path used for resolving relative paths in `possible`
 * @return Absolute path with a leading slash but no trailing slash, e.g. `/a/c/b`
 */
export function getPath(inputPath: Nullish<PossiblePath>, inputBase: AbsolutePath = "/"): AbsolutePath | undefined {
	if (isNullish(inputPath)) return;
	if (isAbsolutePath(inputPath)) return cleanPath(inputPath);
	return joinPath(inputBase, isRelativePath(inputPath) ? inputPath.slice(2) : inputPath);
}

/**
 * Normalise a path:
 * - Runs of `/` and `\` collapsed to a single `/`.
 * - `.` "current-directory" segments dropped (so `./a/b` → `a/b`, `a/./b` → `a/b`, `.` → `""`).
 * - Trailing slashes stripped.
 * - The root `"/"` is preserved as-is.
 */
export function cleanPath(path: AbsolutePath): AbsolutePath;
export function cleanPath(path: string): string;
export function cleanPath(path: string): string {
	const clean = path.replace(/[\\/]+(?:\.(?:[\\/]+|$))*/g, "/");
	return clean.length > 1 && clean.endsWith("/") ? clean.slice(0, -1) : clean;
}

/**
 * Resolve a relative or absolute path and return the path, or throw `RequiredError` if not a valid path.
 * - Internally uses `new URL` to do path processing but shouldn't ever reveal that fact.
 * - Returned paths are cleaned with `cleanPath()` so runs of slashes and trailing slashes are removed.
 *
 * @param path Absolute path e.g. `/a/b/c`, relative path e.g. `./a` or `b` or `../c`, URL string e.g. `http://shax.com/a/b/c`, or `URL` instance.
 * @param base Absolute path used for resolving relative paths in `possible`
 * @return Absolute path with a leading trailing slash, e.g. `/a/c/b`
 */
export function requirePath(path: PossiblePath, base?: AbsolutePath, caller: AnyCaller = requirePath): AbsolutePath {
	const output = getPath(path, base);
	if (!output) throw new RequiredError("Invalid path", { received: path, caller });
	return output;
}

/**
 * Match and strip a base path prefix from a path using segment-aware pathname rules.
 * - Both inputs must be absolute paths that begin with `/`.
 * - Returns `/` when the paths are an exact match.
 */
export function matchPathPrefix(target: PossiblePath, base: PossiblePath, caller: AnyCaller = matchPathPrefix): AbsolutePath | undefined {
	const basePath = requirePath(base, undefined, caller);
	const targetPath = requirePath(target, basePath, caller);
	if (basePath === "/") return targetPath;
	if (targetPath === basePath) return "/";
	if (targetPath.startsWith(`${basePath}/`)) return targetPath.slice(basePath.length) as AbsolutePath;
}

/** Is a target path active? */
export function isPathActive(target: AbsolutePath, current: AbsolutePath): boolean {
	return target === current;
}

/** Is a target path proud (i.e. is the current path, or is a child of the current path)? */
export function isPathProud(target: AbsolutePath, current: AbsolutePath): boolean {
	return target === current || (target !== "/" && target.startsWith(`${current}/`));
}

/**
 * Get the "segments" in an absolute path.
 * - `splitPath("/")` returns `[]` — the root has no segments.
 */
export function splitPath(path: PossiblePath): readonly string[] {
	if (typeof path !== "string") return path;
	if (path === "/") return [];
	return splitString(path.slice(1), "/", 1, undefined, splitPath);
}

/** A single argument accepted by `joinPath()` — either a string (full path or single segment) or an array of segments. */
export type PathPart = string | readonly string[];

/**
 * Join one or more path parts into a single path string.
 * - Each part can be a string (e.g. `"/foo/bar"`, `"foo"`) or an array of segments (e.g. `["foo", "bar"]`). String parts may themselves contain `/` separators — they're flattened and normalised.
 * - Runs of `//` are collapsed and trailing slashes stripped (via `cleanPath()`); `\` Windows slashes are converted too.
 * - If the first argument is an `AbsolutePath` string (starts with `/`), the result is also an `AbsolutePath`; otherwise the return type is `string`.
 *
 * @example joinPath("/foo", "bar") // → "/foo/bar"
 * @example joinPath("/foo", ["bar", "baz"]) // → "/foo/bar/baz"
 * @example joinPath(["foo", "bar"], "baz") // → "foo/bar/baz" (relative — no leading slash)
 * @example joinPath("/a/", "/b/") // → "/a/b" (slashes normalised)
 * @example joinPath("/") // → "/"
 */
export function joinPath(first: AbsolutePath, ...rest: PathPart[]): AbsolutePath;
export function joinPath(...parts: PathPart[]): string;
export function joinPath(...parts: PathPart[]): string {
	return cleanPath(parts.flat().join("/"));
}
