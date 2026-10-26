/**
 * Reuseable utilities for dealing with filesystem paths.
 */

import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";
import { isNullish, splitString } from "./index.js";
import type { Nullish } from "./null.js";

/**
 * Absolute path string starting with a `/` slash.
 *
 * @see https://shelving.cc/util/path/AbsolutePathString
 */
export type AbsolutePathString = `/` | `/${string}`;

/**
 * Relative path string that is `.` dot, or starts with `./` dot slash.
 *
 * @see https://shelving.cc/util/path/RelativePathString
 */
export type RelativePathString = `.` | `./` | `./${string}`;

/**
 * Either an absolute or relative path.
 *
 * @see https://shelving.cc/util/path/PathString
 */
export type PathString = AbsolutePathString | RelativePathString;

/**
 * Things that can be converted to a path.
 *
 * @see https://shelving.cc/util/path/PossiblePath
 */
export type PossiblePath = string | readonly string[];

/**
 * Is a string path an absolute path?
 *
 * @param path The path to test.
 * @returns `true` if `path` is an `AbsolutePathString` starting with `/`, narrowing its type.
 * @see https://shelving.cc/util/path/isAbsolutePath
 */
export function isAbsolutePath(path: PossiblePath): path is AbsolutePathString {
	return typeof path === "string" && path.startsWith("/");
}

/**
 * Is a string path a relative path?
 *
 * @param path The path to test.
 * @returns `true` if `path` is a `RelativePathString` (`.` or starting with `./`), narrowing its type.
 * @see https://shelving.cc/util/path/isRelativePath
 */
export function isRelativePath(path: PossiblePath): path is RelativePathString {
	return typeof path === "string" && (path === "." || path.startsWith("./"));
}

/**
 * Resolve a relative or absolute path and return the absolute path, or `undefined` if not a valid path.
 * - Normalises runs of `//` more than one slash.
 * - Normalises `\` windows paths.
 * - Strips trailing slashes.
 *
 * @param inputPath Absolute path e.g. `/a/b/c`, relative path e.g. `./a` or `b` or `../c`, URL string e.g. `http://shax.com/a/b/c`, or `URL` instance.
 * @param inputBase Absolute path used for resolving relative paths in `inputPath`.
 * @returns Absolute path with a leading slash but no trailing slash, e.g. `/a/c/b`, or `undefined` if `inputPath` is not a valid path.
 * @see https://shelving.cc/util/path/getPath
 */
export function getPath(inputPath: Nullish<PossiblePath>, inputBase: AbsolutePathString = "/"): AbsolutePathString | undefined {
	if (isNullish(inputPath)) return;
	if (isAbsolutePath(inputPath)) return cleanPath(inputPath);
	return joinPath(inputBase, isRelativePath(inputPath) ? inputPath.slice(2) : inputPath);
}

/**
 * Normalise a path.
 * - Runs of `/` and `\` collapsed to a single `/`.
 * - `.` "current-directory" segments dropped (so `./a/b` → `a/b`, `a/./b` → `a/b`, `.` → `""`).
 * - Trailing slashes stripped.
 * - The root `"/"` is preserved as-is.
 *
 * @param path The path to normalise.
 * @returns The normalised path, preserving the absolute/relative type of `path`.
 * @see https://shelving.cc/util/path/cleanPath
 */
export function cleanPath(path: AbsolutePathString): AbsolutePathString;
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
 * @param base Absolute path used for resolving relative paths in `path`.
 * @param caller Function to attribute a thrown error to (defaults to `requirePath` itself).
 * @returns Absolute path with a leading slash but no trailing slash, e.g. `/a/c/b`.
 * @throws {RequiredError} If `path` is not a valid path.
 * @see https://shelving.cc/util/path/requirePath
 */
export function requirePath(path: PossiblePath, base?: AbsolutePathString, caller: AnyCaller = requirePath): AbsolutePathString {
	const output = getPath(path, base);
	if (!output) throw new RequiredError("Invalid path", { received: path, caller });
	return output;
}

/**
 * Match and strip a base path prefix from a path using segment-aware pathname rules.
 * - Both inputs must be absolute paths that begin with `/`.
 * - Returns `/` when the paths are an exact match.
 *
 * @param target Path to match against `base` — relative paths resolve against `base`.
 * @param base Base path whose prefix is stripped from `target`.
 * @param caller Function to attribute a thrown error to (defaults to `matchPathPrefix` itself).
 * @returns The remaining absolute path after stripping `base`, `/` for an exact match, or `undefined` if `target` is not under `base`.
 * @throws {RequiredError} If `target` or `base` is not a valid path.
 * @see https://shelving.cc/util/path/matchPathPrefix
 */
export function matchPathPrefix(
	target: PossiblePath,
	base: PossiblePath,
	caller: AnyCaller = matchPathPrefix,
): AbsolutePathString | undefined {
	const basePath = requirePath(base, undefined, caller);
	const targetPath = requirePath(target, basePath, caller);
	if (basePath === "/") return targetPath;
	if (targetPath === basePath) return "/";
	if (targetPath.startsWith(`${basePath}/`)) return targetPath.slice(basePath.length) as AbsolutePathString;
}

/**
 * Is a target path active relative to the current path?
 * - Active means `target` and `current` are exactly the same path.
 *
 * @param target Path whose status to test.
 * @param current Current path to test against.
 * @returns `true` if `target` is exactly `current`.
 * @see https://shelving.cc/util/path/isPathActive
 */
export function isPathActive(target: AbsolutePathString, current: AbsolutePathString): boolean {
	return target === current;
}

/**
 * Is a target path proud relative to the current path?
 * - Proud means `target` is the current path, or is an ancestor of the current path.
 *
 * @param target Path whose status to test.
 * @param current Current path to test against.
 * @returns `true` if `current` is `target` or a descendant of `target`.
 * @see https://shelving.cc/util/path/isPathProud
 */
export function isPathProud(target: AbsolutePathString, current: AbsolutePathString): boolean {
	return target === current || (target !== "/" && target.startsWith(`${current}/`));
}

/**
 * Get the "segments" in an absolute path.
 * - `splitPath("/")` returns `[]` — the root has no segments.
 *
 * @param path Path to split (an array of segments is returned as-is).
 * @returns Array of path segments.
 * @see https://shelving.cc/util/path/splitPath
 */
export function splitPath(path: PossiblePath): readonly string[] {
	if (typeof path !== "string") return path;
	if (path === "/") return [];
	return splitString(path.slice(1), "/", 1, undefined, splitPath);
}

/**
 * A single argument accepted by `joinPath()` — either a string (full path or single segment) or an array of segments.
 *
 * @see https://shelving.cc/util/path/PathPart
 */
export type PathPart = string | readonly string[];

/**
 * Join one or more path parts into a single path string.
 * - Each part can be a string (e.g. `"/foo/bar"`, `"foo"`) or an array of segments (e.g. `["foo", "bar"]`). String parts may themselves contain `/` separators — they're flattened and normalised.
 * - Runs of `//` are collapsed and trailing slashes stripped (via `cleanPath()`); `\` Windows slashes are converted too.
 * - If the first argument is an `AbsolutePathString` string (starts with `/`), the result is also an `AbsolutePathString`; otherwise the return type is `string`.
 */
export function joinPath(first: AbsolutePathString, ...rest: PathPart[]): AbsolutePathString;
export function joinPath(...parts: PathPart[]): string;
export function joinPath(...parts: PathPart[]): string {
	return cleanPath(parts.flat().join("/"));
}
