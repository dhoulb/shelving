import type { AbsolutePath, Path } from "shelving";
import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";
import { type Nullish, notNullish } from "./null.js";

/**
 * A URL string has a protocol and a `//`.
 * - The `//` at the start of a URL indicates that it has a hierarchical path component, so this makes it a URL.
 * - URLs have a concept of "absolute" or "relative" URLs, since they have a path.
 */
export type URLString = `${string}://${string}`;

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
 */
export interface URL extends globalThis.URL {
	href: URLString;
	origin: URLString;
	pathname: AbsolutePath;
}

/**
 * Construct a correctly-typed `URL` object.
 * - This is a more correctly typed version of the builtin Javascript `URL` constructor.
 * - Requires a URL string, URL object, or path as input, and optionally a base URL.
 * - If a path is provided as input, a base URL _must_ also be provided.
 * - The returned type is
 */
export interface URLConstructor {
	new (input: URLString | URL, base?: URLString | URL): URL;
	new (input: URLString | URL | Path, base: URLString | URL): URL;
}
export const URL = globalThis.URL as URLConstructor;

/** Values that can be converted to a URL instance. */
export type PossibleURL = string | globalThis.URL;

/**
 * Is an unknown value a URL object?
 * - Must be a `URL` instance and have a `host` set, otherwise it's only URI but not a URL.
 */
export function isURL(value: unknown): value is URL {
	return value instanceof URL && !!value.host;
}

/** Assert that an unknown value is a URL object. */
export function assertURL(value: unknown, caller: AnyCaller = assertURL): asserts value is URL {
	if (!isURL(value)) throw new RequiredError("Invalid URL", { received: value, caller });
}

/** Convert a possible URL to a URL, or return `undefined` if conversion fails. */
export function getURL(possible: Nullish<PossibleURL>, base: PossibleURL | undefined = _BASE): URL | undefined {
	if (notNullish(possible)) {
		if (isURL(possible)) return possible;
		try {
			const url = new globalThis.URL(possible, base);
			if (url.host) return url as URL;
		} catch {
			//
		}
	}
}
const _BASE = typeof document === "object" ? document.baseURI : undefined;

/** Convert a possible URL to a URL, or throw `RequiredError` if conversion fails. */
export function requireURL(possible: PossibleURL, base?: PossibleURL | undefined, caller: AnyCaller = requireURL): URL {
	const url = getURL(possible, base);
	assertURL(url, caller);
	return url;
}
