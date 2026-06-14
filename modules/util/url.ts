import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";
import type { Nullish } from "./null.js";
import type { AbsolutePath } from "./path.js";
import type { ImmutableURI } from "./uri.js";

/**
 * A URL string has a protocol and a `//`.
 * - The `//` at the start of a URL indicates that it has a hierarchical path component, so this makes it a URL.
 * - URLs have a concept of "absolute" or "relative" URLs, since they have a path.
 *
 * @see https://dhoulb.github.io/shelving/util/url/URLString
 */
export type URLString = `${string}://${string}`;

/**
 * Construct a correctly-typed `URL` object.
 * - This is a more correctly typed version of the builtin Javascript `URL` constructor.
 * - Requires a URL string, URL object, or path as input, and optionally a base URL.
 * - If a path is provided as input, a base URL _must_ also be provided.
 * - The returned type is
 *
 * @see https://dhoulb.github.io/shelving/util/url/ImmutableURLConstructor
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
 *
 * @see https://dhoulb.github.io/shelving/util/url/ImmutableURL
 */
export interface ImmutableURL extends ImmutableURI {
	readonly href: URLString;
	readonly origin: URLString;
	readonly pathname: AbsolutePath;
}
export const ImmutableURL = URL as ImmutableURLConstructor;

/**
 * Values that can be converted to a URL instance.
 *
 * @see https://dhoulb.github.io/shelving/util/url/PossibleURL
 */
export type PossibleURL = string | URL;

/**
 * Is an unknown value a URL object?
 * - Must be a `URL` instance and its origin must start with `scheme://`
 *
 * @param value Unknown value to test.
 * @returns `true` if `value` is a true `scheme://host` URL object, otherwise `false`.
 *
 * @example
 * ```ts
 * if (isURL(value)) value.pathname; // `value` is narrowed to `ImmutableURL`
 * ```
 *
 * @see https://dhoulb.github.io/shelving/util/url/isURL
 */
export function isURL(value: unknown): value is ImmutableURL {
	return value instanceof URL && _isURL(value);
}
function _isURL(uri: URL): uri is ImmutableURL {
	return uri.href.startsWith(`${uri.protocol}//`);
}

/**
 * Assert that an unknown value is a URL object.
 *
 * @param value Unknown value to test.
 * @param caller Function to attribute a thrown error to — defaults to `assertURL`.
 * @throws RequiredError If `value` is not a true `scheme://host` URL object.
 *
 * @example
 * ```ts
 * assertURL(value);
 * value.pathname; // `value` is narrowed to `ImmutableURL`
 * ```
 *
 * @see https://dhoulb.github.io/shelving/util/url/assertURL
 */
export function assertURL(value: unknown, caller: AnyCaller = assertURL): asserts value is ImmutableURL {
	if (!isURL(value)) throw new RequiredError("Invalid URL", { received: value, caller });
}

/**
 * Resolve a possible URI relative to a base, or return `undefined` if conversion fails.
 * - Returns any kind of URI — not just hierarchical `scheme://host` URLs. Use `getURL()` when a true URL is specifically required.
 * - A `URL` instance is returned as-is (already absolute, base ignored).
 *
 * Note: the base is normalised with `getBaseURL()`, so it is always treated as if it ends in a slash.
 * - e.g. if `base` is `http://p.com/a/b/c` the path resolves relative to `c/` as if a trailing slash was present.
 * - This differs from the default behaviour of `new URL()`, but is the more natural expected result.
 *
 * @param input URI string, URL object, or path to resolve — falsy values return `undefined`.
 * @param base Base URL to resolve a relative `input` against.
 * @returns Resolved `ImmutableURI`, or `undefined` if conversion fails.
 *
 * @example
 * ```ts
 * getBasedURI("path/to/page", "http://example.com/base/"); // `http://example.com/base/path/to/page`
 * ```
 *
 * @see https://dhoulb.github.io/shelving/util/url/getBasedURI
 */
export function getBasedURI(input: Nullish<PossibleURL>, base?: PossibleURL): ImmutableURI | undefined {
	if (!input) return;
	if (input instanceof URL) return input as ImmutableURI;
	try {
		return new URL(input, getBaseURL(base)) as ImmutableURI;
	} catch {
		//
	}
}

/**
 * Resolve a possible URL relative to a base URL, or return `undefined` if conversion fails.
 * - Like `getBasedURI()` but only succeeds for true `scheme://host` URLs — other URIs (e.g. `mailto:`) return `undefined`.
 *
 * @param target URL string, URL object, or path to resolve — falsy values return `undefined`.
 * @param base Base URL to resolve a relative `target` against.
 * @returns Resolved `ImmutableURL`, or `undefined` if conversion fails or the result is not a true URL.
 *
 * @example
 * ```ts
 * getURL("/page", "http://example.com/"); // `http://example.com/page`
 * getURL("mailto:a@b.com"); // `undefined` — not a hierarchical URL
 * ```
 *
 * @see https://dhoulb.github.io/shelving/util/url/getURL
 */
export function getURL(target: Nullish<PossibleURL>, base?: PossibleURL): ImmutableURL | undefined {
	const uri = getBasedURI(target, base);
	if (uri && _isURL(uri)) return uri;
}

/**
 * Convert a possible URL to a URL, or throw `RequiredError` if conversion fails.
 *
 * @param target URL string, URL object, or path to resolve.
 * @param base Base URL to resolve a relative `target` against.
 * @param caller Function to attribute a thrown error to — defaults to `requireURL`.
 * @returns Resolved `ImmutableURL`.
 * @throws RequiredError If `target` cannot be resolved to a true `scheme://host` URL.
 *
 * @example
 * ```ts
 * requireURL("/page", "http://example.com/"); // `http://example.com/page`
 * ```
 *
 * @see https://dhoulb.github.io/shelving/util/url/requireURL
 */
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
 * @param base Base URL the `target` is matched against.
 * @param caller Function to attribute a thrown error to — defaults to `matchURLPrefix`.
 *
 * @returns Absolute path starting with `/`, or `undefined` for origin mismatches or non-matching paths.
 * @throws RequiredError If `target` or `base` cannot be resolved to a true URL.
 *
 * @example
 * ```ts
 * matchURLPrefix("http://x.com/a/b", "http://x.com/a/"); // `/b`
 * ```
 *
 * @see https://dhoulb.github.io/shelving/util/url/matchURLPrefix
 */
export function matchURLPrefix(
	target: PossibleURL | undefined,
	base: PossibleURL | undefined,
	caller: AnyCaller = matchURLPrefix,
): AbsolutePath | undefined {
	if (!target || !base) return;
	const baseURL = requireURL(base, undefined, caller);
	const targetURL = requireURL(target, baseURL, caller);
	if (targetURL.origin !== baseURL.origin) return;
	const basePath = baseURL.pathname;
	const targetPath = targetURL.pathname;
	if (basePath === "/") return targetPath;
	// `basePath` may or may not have a trailing slash, so strip it and re-assert the directory boundary explicitly.
	const bareBase = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
	if (targetPath === bareBase) return "/"; // e.g. `/abc` matches base `/abc` or `/abc/`
	if (targetPath.startsWith(bareBase) && targetPath[bareBase.length] === "/") return targetPath.slice(bareBase.length) as AbsolutePath;
}

/**
 * Is a target URL active relative to a base URL?
 * - Active means `target` and `base` resolve to the exact same URL (same origin, same path).
 * - Origin mismatches return `false`.
 *
 * @param target URL whose status to test — relative paths resolve against `base`.
 * @param base Base URL to test against.
 * @param caller Function to attribute a thrown error to — defaults to `isURLActive`.
 * @returns `true` if `target` resolves to exactly the same URL as `base`, otherwise `false`.
 *
 * @example
 * ```ts
 * isURLActive("http://x.com/a", "http://x.com/a"); // `true`
 * ```
 *
 * @see https://dhoulb.github.io/shelving/util/url/isURLActive
 */
export function isURLActive(target: PossibleURL | undefined, base: PossibleURL | undefined, caller: AnyCaller = isURLActive): boolean {
	return !!target && !!base && matchURLPrefix(target, base, caller) === "/";
}

/**
 * Is a target URL proud relative to a base URL?
 * - Proud means `target` is `base` or a descendant of `base` — i.e. `base` is at or above `target` in the URL hierarchy.
 * - Useful for marking a menu item as "current branch" when the user is somewhere deeper in its sub-tree.
 * - Origin mismatches return `false`.
 *
 * @param target URL whose status to test — relative paths resolve against `base`.
 * @param base Base URL to test against.
 * @param caller Function to attribute a thrown error to — defaults to `isURLProud`.
 * @returns `true` if `target` is `base` or a descendant of `base`, otherwise `false`.
 *
 * @example
 * ```ts
 * isURLProud("http://x.com/a/b", "http://x.com/a"); // `true`
 * ```
 *
 * @see https://dhoulb.github.io/shelving/util/url/isURLProud
 */
export function isURLProud(target: PossibleURL | undefined, base: PossibleURL | undefined, caller: AnyCaller = isURLProud): boolean {
	return !!target && !!base && matchURLPrefix(target, base, caller) !== undefined;
}

/**
 * BaseURL is a URL with a guaranteed trailing slash on pathname.
 *
 * @see https://dhoulb.github.io/shelving/util/url/BaseURL
 */
export interface BaseURL extends ImmutableURL {
	readonly pathname: `/` | `/${string}/`;
}

/**
 * Is an unknown value a valid Base URL?
 * - Must be a true URL whose `pathname` ends in a trailing slash.
 *
 * @param value Value to test.
 * @returns `true` if `value` is a `BaseURL` (a URL with a trailing-slash pathname), otherwise `false`.
 *
 * @example
 * ```ts
 * isBaseURL(new URL("http://x.com/a/")); // `true`
 * ```
 *
 * @see https://dhoulb.github.io/shelving/util/url/isBaseURL
 */
export function isBaseURL(value: PossibleURL): value is BaseURL {
	return isURL(value) && _isBaseURL(value);
}
function _isBaseURL(uri: URL): uri is BaseURL {
	return uri.pathname.endsWith("/");
}

/**
 * Get a Base URL — a true URL whose `pathname` is normalised to end in a trailing slash.
 * - Falsy or non-URL input returns `undefined`.
 * - A URL without a trailing slash is cloned and given one (the input is never mutated).
 *
 * @param input URL string, URL object, or path to normalise.
 * @returns `BaseURL` with a trailing-slash pathname, or `undefined` if `input` is not a true URL.
 *
 * @example
 * ```ts
 * getBaseURL("http://x.com/a"); // `http://x.com/a/`
 * ```
 *
 * @see https://dhoulb.github.io/shelving/util/url/getBaseURL
 */
export function getBaseURL(input: Nullish<PossibleURL>): BaseURL | undefined {
	if (!input) return;
	const uri = getBasedURI(input, undefined);
	if (!uri || !_isURL(uri)) return;
	if (_isBaseURL(uri)) return uri;
	// Clone before mutating: when `input` was a `URL` instance, `getBasedURI` returned that same instance, so mutating it would corrupt the caller's object. A string input always yields a fresh `uri`.
	const base: URL = typeof input === "string" ? uri : new URL(uri);
	base.pathname = `${uri.pathname}/`; // Add a trailing slash.
	return base as BaseURL;
}

/**
 * Require a Base URL — a true URL whose `pathname` is normalised to end in a trailing slash.
 *
 * @param value URL string, URL object, or path to normalise.
 * @param caller Function to attribute a thrown error to.
 * @returns `BaseURL` with a trailing-slash pathname.
 * @throws RequiredError If `value` cannot be resolved to a true URL.
 *
 * @example
 * ```ts
 * requireBaseURL("http://x.com/a", requireBaseURL); // `http://x.com/a/`
 * ```
 *
 * @see https://dhoulb.github.io/shelving/util/url/requireBaseURL
 */
export function requireBaseURL(value: PossibleURL, caller: AnyCaller): BaseURL {
	const url = getBaseURL(value);
	if (!url) throw new RequiredError("Invalid base URL", { received: value, caller });
	return url;
}
