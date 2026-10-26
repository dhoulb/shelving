import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";
import type { Nullish } from "./null.js";
import { type AbsolutePathString, cleanPath } from "./path.js";
import type { ImmutableURI, URIHash, URIScheme, URISearch } from "./uri.js";

/**
 * A URL string has a protocol and a `//`.
 * - The `//` at the start of a URL indicates that it has a hierarchical path component, so this makes it a URL.
 * - URLs have a concept of "absolute" or "relative" URLs, since they have a path.
 *
 * @see https://shelving.cc/util/url/URLString
 */
export type URLString = `${string}://${string}`;

/**
 * Values that can be converted to a URL instance.
 *
 * @see https://shelving.cc/util/url/PossibleURL
 */
export type PossibleURL = string | URL;

/**
 * Absolute URL object that describes a valid URL, e.g. `http://example.com/path/to/resource`
 * - Extends the builtin Javascript `URL` class and types its properties more accurately.
 * - The constructor throws `RequiredError` unless the result is a true `scheme://host` URL, so every instance is a true URL.
 * - Javascript `URL` objects are mutable — treat `AbsoluteURL` instances as immutable and do not set their properties.
 *
 * URI and URL differences:
 * - According to RFC 3986, URLs are a subset of URIs that have a hierarchical path component, e.g. `http://example.com/path`.
 * - The `//` at the start of a URL indicates that it has a hierarchical path component, so this makes it a URL.
 * - The absence of `//` indicates a non-hierarchical URI.
 * - All URLs are also URIs, but not all URIs are URLs.
 * - A Javascript `URL` instance can represent any kind of URI (not just URLs), which is why this class checks the result.
 *
 * @example new AbsoluteURL("/a/b", "https://example.com"); // https://example.com/a/b
 * @see https://shelving.cc/util/url/AbsoluteURL
 */
export class AbsoluteURL extends URL {
	declare readonly hash: URIHash | ``;
	declare readonly host: string;
	declare readonly hostname: string;
	declare readonly href: URLString;
	declare readonly origin: URLString;
	declare readonly password: string;
	declare readonly pathname: AbsolutePathString;
	declare readonly port: string;
	declare readonly protocol: URIScheme;
	declare readonly search: URISearch | ``;
	declare readonly username: string;

	/**
	 * @param input URL string, URL object, or path to resolve.
	 * @param base Base URL to resolve a relative `input` against (used as-is, like `new URL()`).
	 * @param caller Function to attribute a thrown error to — defaults to the `AbsoluteURL` class.
	 * @throws RequiredError If `input` cannot be resolved to a true `scheme://host` URL.
	 */
	constructor(input: PossibleURL, base?: PossibleURL, caller: AnyCaller = AbsoluteURL) {
		const href = _getURLHref(input, base);
		if (!href) throw new RequiredError("Invalid URL", { received: input, caller });
		super(href);
	}
}

/** Resolve an input to the `href` of a true `scheme://host` URL, or return `undefined` if it is not one. */
function _getURLHref(input: PossibleURL, base: PossibleURL | undefined): string | undefined {
	try {
		const uri = new URL(input, base);
		if (_isURL(uri)) return uri.href;
	} catch {
		//
	}
}

/**
 * Is an unknown value an `AbsoluteURL` object?
 * - Plain `URL` instances return `false` — use `getURL()` to convert them.
 *
 * @param value Unknown value to test.
 * @returns `true` if `value` is an `AbsoluteURL` instance, otherwise `false`.
 *
 * @see https://shelving.cc/util/url/isURL
 */
export function isURL(value: unknown): value is AbsoluteURL {
	return value instanceof AbsoluteURL;
}
function _isURL(uri: URL): boolean {
	return uri.href.startsWith(`${uri.protocol}//`);
}

/**
 * Assert that an unknown value is a URL object.
 *
 * @param value Unknown value to test.
 * @param caller Function to attribute a thrown error to — defaults to `assertURL`.
 * @throws RequiredError If `value` is not an `AbsoluteURL` instance.
 *
 * @see https://shelving.cc/util/url/assertURL
 */
export function assertURL(value: unknown, caller: AnyCaller = assertURL): asserts value is AbsoluteURL {
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
 * @see https://shelving.cc/util/url/getBasedURI
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
 * - An `AbsoluteURL` instance is returned as-is. A plain `URL` instance is converted to a new `AbsoluteURL`.
 *
 * @param target URL string, URL object, or path to resolve — falsy values return `undefined`.
 * @param base Base URL to resolve a relative `target` against.
 * @returns Resolved `AbsoluteURL`, or `undefined` if conversion fails or the result is not a true URL.
 *
 * @see https://shelving.cc/util/url/getURL
 */
export function getURL(target: Nullish<PossibleURL>, base?: PossibleURL): AbsoluteURL | undefined {
	if (target instanceof AbsoluteURL) return target;
	const uri = getBasedURI(target, base);
	if (uri && _isURL(uri)) return new AbsoluteURL(uri);
}

/**
 * Convert a possible URL to a URL, or throw `RequiredError` if conversion fails.
 *
 * @param target URL string, URL object, or path to resolve.
 * @param base Base URL to resolve a relative `target` against.
 * @param caller Function to attribute a thrown error to — defaults to `requireURL`.
 * @returns Resolved `AbsoluteURL`.
 * @throws RequiredError If `target` cannot be resolved to a true `scheme://host` URL.
 *
 * @see https://shelving.cc/util/url/requireURL
 */
export function requireURL(target: PossibleURL, base?: PossibleURL, caller: AnyCaller = requireURL): AbsoluteURL {
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
 * - The resolved target pathname is normalised with `cleanPath()` — runs of slashes are collapsed and a trailing slash is stripped (the root `/` is preserved) — so `/foo` and `/foo/` resolve to the same path. This mirrors the path-based sibling `matchPathPrefix()`.
 *
 * @param target URL to match against `base` — if this is a relative path it will be resolved against `base`
 * @param base Base URL the `target` is matched against.
 * @param caller Function to attribute a thrown error to — defaults to `matchURLPrefix`.
 *
 * @returns Absolute path starting with `/`, or `undefined` for origin mismatches or non-matching paths.
 * @throws RequiredError If `target` or `base` cannot be resolved to a true URL.
 *
 * @see https://shelving.cc/util/url/matchURLPrefix
 */
export function matchURLPrefix(
	target: PossibleURL | undefined,
	base: PossibleURL | undefined,
	caller: AnyCaller = matchURLPrefix,
): AbsolutePathString | undefined {
	if (!target || !base) return;
	const baseURL = requireURL(base, undefined, caller);
	const targetURL = requireURL(target, baseURL, caller);
	if (targetURL.origin !== baseURL.origin) return;
	const basePath = baseURL.pathname;
	const targetPath = cleanPath(targetURL.pathname);
	if (basePath === "/") return targetPath;
	// `basePath` may or may not have a trailing slash, so strip it and re-assert the directory boundary explicitly.
	const bareBase = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
	if (targetPath === bareBase) return "/"; // e.g. `/abc` matches base `/abc` or `/abc/`
	if (targetPath.startsWith(bareBase) && targetPath[bareBase.length] === "/")
		return targetPath.slice(bareBase.length) as AbsolutePathString;
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
 * @see https://shelving.cc/util/url/isURLActive
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
 * @see https://shelving.cc/util/url/isURLProud
 */
export function isURLProud(target: PossibleURL | undefined, base: PossibleURL | undefined, caller: AnyCaller = isURLProud): boolean {
	return !!target && !!base && matchURLPrefix(target, base, caller) !== undefined;
}

/**
 * BaseURL is an `AbsoluteURL` with a guaranteed trailing slash on pathname.
 *
 * @see https://shelving.cc/util/url/BaseURL
 */
export interface BaseURL extends AbsoluteURL {
	readonly pathname: `/` | `/${string}/`;
}

/**
 * Is an unknown value a valid Base URL?
 * - Must be a true URL whose `pathname` ends in a trailing slash.
 *
 * @param value Value to test.
 * @returns `true` if `value` is a `BaseURL` (an `AbsoluteURL` with a trailing-slash pathname), otherwise `false`.
 *
 * @see https://shelving.cc/util/url/isBaseURL
 */
export function isBaseURL(value: unknown): value is BaseURL {
	return isURL(value) && _isBaseURL(value);
}
function _isBaseURL(url: AbsoluteURL): url is BaseURL {
	return url.pathname.endsWith("/");
}

/**
 * Get a Base URL — a true URL whose `pathname` is normalised to end in a trailing slash.
 * - Falsy or non-URL input returns `undefined`.
 * - An `AbsoluteURL` that already ends in a slash is returned as-is.
 * - A URL without a trailing slash is cloned and given one (the input is never mutated).
 *
 * @param input URL string, URL object, or path to normalise.
 * @returns `BaseURL` with a trailing-slash pathname, or `undefined` if `input` is not a true URL.
 *
 * @see https://shelving.cc/util/url/getBaseURL
 */
export function getBaseURL(input: Nullish<PossibleURL>): BaseURL | undefined {
	const url = getURL(input);
	if (!url) return;
	if (_isBaseURL(url)) return url;
	// Clone before mutating: when `input` was an `AbsoluteURL` instance, `getURL()` returned that same instance, so mutating it would corrupt the caller's object.
	const base: URL = new AbsoluteURL(url);
	base.pathname = `${url.pathname}/`; // Add a trailing slash.
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
 * @see https://shelving.cc/util/url/requireBaseURL
 */
export function requireBaseURL(value: PossibleURL, caller: AnyCaller): BaseURL {
	const url = getBaseURL(value);
	if (!url) throw new RequiredError("Invalid base URL", { received: value, caller });
	return url;
}
