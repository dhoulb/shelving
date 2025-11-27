import { type Nullish, notNullish } from "shelving";
import { RequiredError } from "../error/RequiredError.js";
import { ValueError } from "../error/ValueError.js";
import type { MutableArray } from "./array.js";
import { type DictionaryItem, getDictionaryItems, type ImmutableDictionary, isDictionary, type MutableDictionary } from "./dictionary.js";
import type { AnyCaller } from "./function.js";
import { getString, isString } from "./string.js";
import type { URL, URLString } from "./url.js";

/**
 * Valid URI string is anything following `protocol:resource` format, e.g. `urn:isbn:0451450523` or `http://example.com/path/to/resource`
 *
 * URI and URL differences:
 * - According to RFC 3986, URLs are a subset of URIs that have a hierarchical path component, e.g. `http://example.com/path`.
 * - The `//` at the start of a URL indicates that it has a hierarchical path component, so this makes it a URL.
 * - The absence of `//` indicates a non-hierarchical URI.
 * - URLs can be considered as "hierarchical URIs".
 * - All URLs are also URIs, but not all URIs are URLs.
 */
export type URIString = `${string}:${string}`;

/**
 * Object that describes a valid URI, e.g. `urn:isbn:0451450523` or `http://example.com/path/to/resource`
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
export interface URI extends globalThis.URL {
	href: URIString;
	origin: URIString;
}

/**
 * Construct a correctly-typed `URI` object.
 * - This is a more correctly typed version of the builtin Javascript `URI` constructor.
 * - Requires a URI string, URI object, or path as input, and optionally a base URI.
 * - If a path is provided as input, a base URI _must_ also be provided.
 * - The returned type is
 */
export interface URIConstructor {
	new (input: URIString | URI): URI;
}
export const URI = globalThis.URL as URIConstructor;

/** Values that can be converted to a URI instance. */
export type PossibleURI = string | globalThis.URL;

/** Is an unknown value a URI object? */
export function isURI(value: unknown): value is URI {
	return value instanceof URI;
}

/** Assert that an unknown value is a URI object. */
export function assertURI(value: unknown, caller: AnyCaller = assertURI): asserts value is URI {
	if (!isURI(value)) throw new RequiredError("Invalid URI", { received: value, caller });
}

/** Convert a possible URI to a URI, or return `undefined` if conversion fails. */
export function getURI(possible: Nullish<PossibleURI>): URI | undefined {
	if (notNullish(possible)) {
		if (isURI(possible)) return possible;
		try {
			return new globalThis.URL(possible) as URI;
		} catch {
			return undefined;
		}
	}
}

/** Convert a possible URI to a URI, or throw `RequiredError` if conversion fails. */
export function requireURI(possible: PossibleURI, caller: AnyCaller = requireURI): URI {
	const url = getURI(possible);
	assertURI(url, caller);
	return url;
}

/** Convert a possible URI to a URI string, or return `undefined` if conversion fails. */
export function getURIString(possible: Nullish<PossibleURI>): URIString | undefined {
	return getURI(possible)?.href;
}

/** Convert a possible URI to a URI string, or throw `RequiredError` if conversion fails. */
export function requireURIString(possible: PossibleURI, caller: AnyCaller = requireURIString): URIString | undefined {
	return requireURI(possible, caller).href;
}

/** Type for a set of named URL parameters. */
export type URIParams = ImmutableDictionary<string>;

/** Type for things that can be converted to named URI parameters. */
export type PossibleURIParams = PossibleURI | URLSearchParams | ImmutableDictionary<unknown>;

/**
 * Get a set of entries for a set of possible URI params.
 *
 * Note: Not as simple as just converting with `Object.fromEntries()`:
 * 1. When `URLSearchParams` contains multiple values for the same key, calling `params.get()` will return the _first_ value.
 * 2. So when converting this to a simple data object, only one value per key can be represented, but it needs to be the _first_ one.
 * 3. Since we're looping through anyway, we also take the time to convert values to strings, so we can accept a wider range of input types.
 */
function* getURIEntries(input: PossibleURIParams, caller: AnyCaller = getURIParams): Iterable<DictionaryItem<string>> {
	if (input instanceof URLSearchParams) {
		yield* input;
	} else if (isString(input) || input instanceof globalThis.URL) {
		yield* requireURI(input, caller).searchParams;
	} else {
		const done: MutableArray<string> = [];
		for (const [key, value] of getDictionaryItems(input)) {
			if (done.includes(key)) continue;
			done.push(key);
			const str = getString(value);
			if (str === undefined) throw new ValueError(`URI param "${key}" must be string`, { received: value, caller });
			yield [key, str];
		}
	}
}

/** Get a set of params for a URI as a dictionary. */
export function getURIParams(input: PossibleURIParams, caller: AnyCaller = getURIParams): URIParams {
	const output: MutableDictionary<string> = {};
	for (const [key, str] of getURIEntries(input, caller)) output[key] = str;
	return output;
}

/** Get a single named param from a URI. */
export function getURIParam(input: PossibleURIParams, key: string): string | undefined {
	if (input instanceof URLSearchParams) return input.get(key) || undefined;
	if (isDictionary(input)) return getString(input[key]);
	return getURIParams(input)[key];
}

/** Get a single named param from a URI. */
export function requireURIParam(input: PossibleURIParams, key: string, caller: AnyCaller = requireURIParam): string {
	const value = getURIParam(input, key);
	if (value === undefined) throw new RequiredError(`URI param "${key}" is required`, { received: input, caller });
	return value;
}

/**
 * Return a URI with a new param set (or same URI if no changes were made).
 * - Throws `ValueError` if the value could not be converted to a string.
 */
export function withURIParam(url: URL | URLString, key: string, value: unknown, caller?: AnyCaller): URL;
export function withURIParam(url: PossibleURI, key: string, value: unknown, caller?: AnyCaller): URI;
export function withURIParam(url: PossibleURI, key: string, value: unknown, caller: AnyCaller = withURIParam): URI {
	const input = requireURI(url, caller);
	const output = new URI(input);
	const str = getString(value);
	if (str === undefined) throw new ValueError(`URI param "${key}" must be string`, { received: value, caller });
	output.searchParams.set(key, str);
	return input.href === output.href ? input : output;
}

/**
 * Return a URI with several new params set (or same URI if no changes were made).
 * - Throws `ValueError` if any of the values could not be converted to strings.
 */
export function withURIParams(url: URL | URLString, params: PossibleURIParams, caller?: AnyCaller): URL;
export function withURIParams(url: PossibleURI, params: PossibleURIParams, caller?: AnyCaller): URI;
export function withURIParams(url: PossibleURI, params: PossibleURIParams, caller: AnyCaller = withURIParams): URI {
	const input = requireURI(url, caller);
	const output = new URI(input);
	for (const [key, str] of getURIEntries(params, caller)) output.searchParams.set(key, str);
	return input.href === output.href ? input : output;
}

/** Return a URI without one or more params (or same URI if no changes were made). */
export function omitURIParams(url: URL | URLString, ...keys: string[]): URL;
export function omitURIParams(url: PossibleURI, ...keys: string[]): URI;
export function omitURIParams(url: PossibleURI, ...keys: string[]): URI {
	const input = requireURI(url, omitURIParams);
	const output = new URI(input);
	for (const key of keys) output.searchParams.delete(key);
	return input.href === output.href ? input : output;
}

/** Return a URI without a param (or same URI if no changes were made). */
export const omitURIParam: (url: PossibleURI, key: string) => URI = omitURIParams;
