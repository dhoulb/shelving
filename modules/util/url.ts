import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";
import type { Nullish } from "./null.js";
import type { AbsolutePath } from "./path.js";
import type { ImmutableURI } from "./uri.js";

/**
 * A URL string has a protocol and a `//`.
 * - The `//` at the start of a URL indicates that it has a hierarchical path component, so this makes it a URL.
 * - URLs have a concept of "absolute" or "relative" URLs, since they have a path.
 */
export type URLString = `${string}://${string}`;

/**
 * Construct a correctly-typed `URL` object.
 * - This is a more correctly typed version of the builtin Javascript `URL` constructor.
 * - Requires a URL string, URL object, or path as input, and optionally a base URL.
 * - If a path is provided as input, a base URL _must_ also be provided.
 * - The returned type is
 */
export interface ImmutableURLConstructor {
	new (input: URLString | ImmutableURL, base?: URLString | ImmutableURL): ImmutableURL;
	new (input: URLString | ImmutableURL | string, base: URLString | ImmutableURL): ImmutableURL;
}

/**
 * Object that describes a valid URL, e.g. `http://example.com/path/to/resource`
 * - Improves the builtin Javascript `URL` class to more accurately type its properties.
 *
 * URI and URL differences:
 * - According to RFC 3986, URLs are a subset of URIs that have a hierarchical path component, e.g. `http://example.com/path`.
 * - The `//` at the start of a URL indicates that it has a hierarchical path component, so this makes it a URL.
 * - The absence of `//` indicates a non-hierarchical URI.
 * - URLs can be considered as "hierarchical URIs".
 * - All URLs are also URIs, but not all URIs are URLs.
 *
 * Javascript URL problems:
 * - Javascript `URL` instance can actually represent any kind of URI (not just URLs).
 * - It's more "correct" terminology to use `URI` to refer to what the Javascript `URL` class represents.
 * - You can tell the difference because a URL will have a non-empty `host` property, whereas URIs will never have a `host` (it will be `""` empty string).
 * - Javascript URLs are mutable which can lead to subtle bugs.
 */
export interface ImmutableURL extends ImmutableURI {
	readonly href: URLString;
	readonly origin: URLString;
	readonly pathname: AbsolutePath;
}
export const ImmutableURL = URL as ImmutableURLConstructor;

/** Values that can be converted to a URL instance. */
export type PossibleURL = string | URL;

/**
 * Is an unknown value a URL object?
 * - Must be a `URL` instance and its origin must start with `scheme://`
 */
export function isURL(value: unknown): value is ImmutableURL {
	return value instanceof URL && _isURL(value);
}
function _isURL(uri: URL): uri is ImmutableURL {
	return uri.href.startsWith(`${uri.protocol}//`);
}

/** Assert that an unknown value is a URL object. */
export function assertURL(value: unknown, caller: AnyCaller = assertURL): asserts value is ImmutableURL {
	if (!isURL(value)) throw new RequiredError("Invalid URL", { received: value, caller });
}

/**
 * Resolve a possible URL relative to a base URL, or return `undefined` if conversion fails.
 *
 * Note: When resolving relative URLs this treats `base` as if it ends in a slash.
 * - e.g. if `base` is `http://p.com/a/b/c` the path will be relative to `c` as if a `/` trailing slash was present.
 * - This is different to the default behaviour of `new URL()`, but is the more natural expected result
 * - This is consistent with our e.g. `getURL()` utilities.
 *
 */
export function getURL(target: Nullish<PossibleURL>, base?: PossibleURL): ImmutableURL | undefined {
	if (!target) return;
	const uri = _getURL(target, base);
	if (uri && _isURL(uri)) return uri;
}
function _getURL(target: PossibleURL, base?: PossibleURL): URL | undefined {
	if (target instanceof URL) return target;
	try {
		// We need a base URL to potentially parse this URL against.
		// Use the document base (if set) as the default URL.
		const baseURL = getBaseURL(base ?? (typeof document === "object" ? document.baseURI : undefined));
		return new URL(target, baseURL);
	} catch {
		//
	}
}

/** Convert a possible URL to a URL, or throw `RequiredError` if conversion fails. */
export function requireURL(target: PossibleURL, base?: PossibleURL, caller: AnyCaller = requireURL): ImmutableURL {
	const url = getURL(target, base);
	assertURL(url, caller);
	return url;
}

/**
 * Resolve and match a target URL/path against a base URL and return the remaining path.
 *
 * - Need to be valid _URLs_ not just _URIs_, i.e. needs to have `protocol://` at the start.
 * - Origins need to match, i.e. `http://localhost` !== `http://localhost:4020`
 * - Relative targets are resolved against the normalized base URL.
 *
 * @param target URL to match against `base` — if this is a relative path it will be resolved against `base`
 *
 * @returns Absolute path starting with `/`, or `undefined` for origin mismatches or non-matching paths.
 */
export function matchURLPrefix(target: PossibleURL, base: PossibleURL, caller: AnyCaller = matchURLPrefix): AbsolutePath | undefined {
	const baseURL = requireBaseURL(base, caller);
	const targetURL = requireURL(target, baseURL, caller);
	if (targetURL.origin !== baseURL.origin) return;
	const basePath = baseURL.pathname;
	const targetPath = targetURL.pathname;
	if (basePath === "/") return targetPath;
	if (targetPath === basePath.slice(0, -1)) return "/"; // e.g. `/abc` and `/abc/`
	if (targetPath.startsWith(basePath)) return targetPath.slice(basePath.length - 1) as AbsolutePath;
}

/** BaseURL is a URL with a guaranteed trailing slash on pathname. */
export interface BaseURL extends ImmutableURL {
	readonly pathname: `/` | `/${string}/`;
}

/** Is an unknown value a valid Base URL. */
export function isBaseURL(value: PossibleURL): value is BaseURL {
	return isURL(value) && _isBaseURL(value);
}
function _isBaseURL(uri: URL): uri is BaseURL {
	return uri.pathname.endsWith("/");
}

/** Get a Base URL. */
export function getBaseURL(input: Nullish<PossibleURL>): BaseURL | undefined {
	if (!input) return;
	const uri = _getURL(input, undefined);
	if (!uri || !_isURL(uri)) return;
	if (_isBaseURL(uri)) return uri;
	const base: URL = typeof input === "string" ? uri : new URL(uri);
	base.pathname = `${uri.pathname}/`; // Add a trailing slash.
	return base as BaseURL;
}

/** Require a Base URL. */
export function requireBaseURL(value: PossibleURL, caller: AnyCaller): BaseURL {
	const url = getBaseURL(value);
	if (!url) throw new RequiredError("Invalid base URL", { received: value, caller });
	return url;
}
