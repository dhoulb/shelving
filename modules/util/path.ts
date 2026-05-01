import { RequiredError } from "../error/RequiredError.js";
import type { ImmutableArray } from "./array.js";
import type { AnyCaller } from "./function.js";
import type { Nullish } from "./null.js";

/** Absolute path string starts with `/` slash. */
export type AbsolutePath = `/` | `/${string}`;

/** Relative path string is `.` dot, or starts with `./` dot slash. */
export type RelativePath = `.` | `./` | `./${string}`;

/** Simple path string like `a/b/c` */
export type SimplePath = string;

/** Things that can be converted to a path. */
export type PossiblePath = string;

/** List of non-empty path segments. */
export type PathSegments = ImmutableArray<string>;

const SPLIT_SEGMENTS = /[\\/]+/g;
const ALL_DOTS = /^\.+$/;
const UNSAFE_CHARS = /[^A-Za-z0-9_.-]+/g;

/**
 * Is a string a valid path segment, e.g. `abc` or `myFile.pdf` or `.myFile`
 * - Disallows `""` empty string.
 * - Disallows runs of `.` as the only contents (e.g. `.`, `..` or `...`).
 * - Disallows characters outside `A-Za-z0-9_.-`
 */
export function isPathSegment(segment: string): boolean {
	return segment.length > 0 && !ALL_DOTS.test(segment) && !UNSAFE_CHARS.test(segment);
}

/** Get a simple path segment after filtering out invalid characters. */
export function getPathSegment(input: string): string {
	const output = input.replace(UNSAFE_CHARS, "");
	return ALL_DOTS.test(output) ? "" : output;
}

/**
 * Is a string a simple path, e.g. `a/b/c`
 * - Separated by `/` slashes.
 * - No leading/trailing slashes.
 */
export function isPath(path: string): boolean {
	return !path.length || path.split("/").every(isPathSegment);
}

/** Is a string path an absolute path? */
export function isAbsolutePath(path: string): path is AbsolutePath {
	return path.startsWith("/") && isPath(path.slice(1));
}

/** Is a string path an relative path? */
export function isRelativePath(path: string): path is RelativePath {
	return path === "." || (path.startsWith("./") && isPath(path.slice(2)));
}

/** Split a path into simple path segments, e.g. `a/b/c` -> ["a", "b", "c"] */
export function splitPath(path: string): PathSegments {
	return path?.split(SPLIT_SEGMENTS).map(getPathSegment).filter(Boolean) ?? [];
}

/** Join path segments into an absolute path, e.g. ["a", "b", "c"] -> `/a/b/c` */
export function joinPath(...segments: PathSegments): AbsolutePath {
	return `/${segments.join("/")}`;
}

/**
 * Resolve a relative or absolute path and return the absolute path, or `undefined` if not a valid path.
 * - Returned paths are cleaned with `cleanPath()` so runs of slashes and trailing slashes are removed.
 *
 * @param path Absolute path e.g. `/a/b/c`, relative path e.g. `./a` or `b` or `../c`, URL string e.g. `http://shax.com/a/b/c`, or `URL` instance.
 * @param base Absolute path used for resolving relative paths in `possible`
 * @return Absolute path with a leading slash but no trailing slash, e.g. `/a/c/b`
 */
export function getAbsolutePath(path: Nullish<PossiblePath>, base: AbsolutePath = "/"): AbsolutePath | undefined {
	if (!path) return;
	if (path === "/") return "/"; // Hot passthrough.
	if (path.startsWith("/")) return joinPath(...splitPath(path));
	return joinPath(...splitPath(base), ...splitPath(path));
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
export function requireAbsolutePath(
	path: AbsolutePath | RelativePath,
	base?: AbsolutePath,
	caller: AnyCaller = requireAbsolutePath,
): AbsolutePath {
	const output = getAbsolutePath(path, base);
	if (!output) throw new RequiredError("Invalid path", { received: path, caller });
	return output;
}

/**
 * Match and strip a base path prefix from a path using segment-aware pathname rules.
 * - Both inputs must be absolute paths that begin with `/`.
 * - Returns `/` when the paths are an exact match.
 */
export function matchPathPrefix(
	path: AbsolutePath | RelativePath,
	base: AbsolutePath,
	caller: AnyCaller = matchPathPrefix,
): AbsolutePath | undefined {
	const normalBase = requireAbsolutePath(base, undefined, caller);
	const normalPath = requireAbsolutePath(path, normalBase, caller);
	if (normalBase === "/") return normalPath;
	if (normalPath === normalBase) return "/";
	if (normalPath.startsWith(`${normalBase}/`)) return normalPath.slice(normalBase.length) as AbsolutePath;
}

/** Is a target path active? */
export function isPathActive(target: AbsolutePath, current: AbsolutePath): boolean {
	return target === current;
}

/** Is a target path proud (i.e. is the current path, or is a child of the current path)? */
export function isPathProud(target: AbsolutePath, current: AbsolutePath): boolean {
	return target === current || (target !== "/" && target.startsWith(`${current}/`));
}
