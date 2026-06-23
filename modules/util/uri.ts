import { RequiredError } from "../error/RequiredError.js";
import { ValueError } from "../error/ValueError.js";
import type { ImmutableArray, MutableArray } from "./array.js";
import { type DictionaryItem, getDictionaryItems, type ImmutableDictionary, isDictionary, type MutableDictionary } from "./dictionary.js";
import type { AnyCaller } from "./function.js";
import type { Nullish } from "./null.js";
import { getString, isString } from "./string.js";
import type { ImmutableURL, URLString } from "./url.js";

/**
 * Valid URI string is anything following `protocol:resource` format, e.g. `urn:isbn:0451450523` or `http://example.com/path/to/resource`
 *
 * URI and URL differences:
 * - According to RFC 3986, URLs are a subset of URIs that have a hierarchical path component, e.g. `http://example.com/path`.
 * - The `//` at the start of a URL indicates that it has a hierarchical path component, so this makes it a URL.
 * - The absence of `//` indicates a non-hierarchical URI.
 * - URLs can be considered as "hierarchical URIs".
 * - All URLs are also URIs, but not all URIs are URLs.
 *
 * @see https://shelving.cc/util/uri/URIString
 */
export type URIString = `${string}:${string}`;

/**
 * String for the search component of a URI, including the leading `?`
 *
 * @see https://shelving.cc/util/uri/URISearch
 */
export type URISearch = `?${string}`;

/**
 * String for the hash component of a URI, including the leading `#`
 *
 * @see https://shelving.cc/util/uri/URIHash
 */
export type URIHash = `#${string}`;

/**
 * Construct a correctly-typed `URI` object.
 * - This is a more correctly typed version of the builtin Javascript `URL` constructor.
 * - Takes a URI string or URI object that already encodes a complete URI — no base parameter, so relative inputs are not accepted.
 * - To resolve a relative input against a base, use `getBasedURI()` from `url.ts`.
 *
 * @see https://shelving.cc/util/uri/ImmutableURIConstructor
 */
export interface ImmutableURIConstructor {
	/**
	 * Construct an `ImmutableURI` from a complete URI string or URI object.
	 *
	 * @param input URI string or URI object that already encodes a complete URI.
	 * @returns New `ImmutableURI` instance.
	 * @throws {TypeError} If `input` is not a valid complete URI.
	 * @see https://shelving.cc/util/uri/ImmutableURIConstructor/new
	 */
	new (input: URIString | ImmutableURI): ImmutableURI;
}

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
 * @see https://shelving.cc/util/uri/ImmutableURI
 */
export interface ImmutableURI extends URL {
	/**
	 * Hash component of the URI, including the leading `#` (empty string if absent).
	 *
	 * @see https://shelving.cc/util/uri/ImmutableURI/hash
	 */
	readonly hash: URIHash | ``;
	/**
	 * Host component of the URI (hostname and port), or empty string for non-hierarchical URIs.
	 *
	 * @see https://shelving.cc/util/uri/ImmutableURI/host
	 */
	readonly host: string;
	/**
	 * Hostname component of the URI, or empty string for non-hierarchical URIs.
	 *
	 * @see https://shelving.cc/util/uri/ImmutableURI/hostname
	 */
	readonly hostname: string;
	/**
	 * Full URI string.
	 *
	 * @see https://shelving.cc/util/uri/ImmutableURI/href
	 */
	readonly href: URIString;
	/**
	 * Origin of the URI, or the string `"null"` for origins that cannot be serialised.
	 *
	 * @see https://shelving.cc/util/uri/ImmutableURI/origin
	 */
	readonly origin: URIString | `null`;
	/**
	 * Password component of the URI (empty string if absent).
	 *
	 * @see https://shelving.cc/util/uri/ImmutableURI/password
	 */
	readonly password: string;
	/**
	 * Pathname component of the URI.
	 *
	 * @see https://shelving.cc/util/uri/ImmutableURI/pathname
	 */
	readonly pathname: string;
	/**
	 * Port component of the URI (empty string if absent).
	 *
	 * @see https://shelving.cc/util/uri/ImmutableURI/port
	 */
	readonly port: string;
	/**
	 * Protocol scheme of the URI, including the trailing `:`
	 *
	 * @see https://shelving.cc/util/uri/ImmutableURI/protocol
	 */
	readonly protocol: URIScheme;
	/**
	 * Search component of the URI, including the leading `?` (empty string if absent).
	 *
	 * @see https://shelving.cc/util/uri/ImmutableURI/search
	 */
	readonly search: URISearch | ``;
	/**
	 * Username component of the URI (empty string if absent).
	 *
	 * @see https://shelving.cc/util/uri/ImmutableURI/username
	 */
	readonly username: string;
}
/**
 * Correctly-typed `URI` constructor (the builtin `URL` class typed as `ImmutableURIConstructor`).
 *
 * @see https://shelving.cc/util/uri/ImmutableURI
 */
export const ImmutableURI = URL as ImmutableURIConstructor;

/**
 * Values that can be converted to an `ImmutableURI` instance.
 *
 * @see https://shelving.cc/util/uri/PossibleURI
 */
export type PossibleURI = string | URL;

/**
 * Is an unknown value a URI object?
 *
 * @param value The value to test.
 * @returns `true` if `value` is an `ImmutableURI`, narrowing its type.
 * @example isURI(new URL("http://x.com")) // true
 * @see https://shelving.cc/util/uri/isURI
 */
export function isURI(value: unknown): value is ImmutableURI {
	return value instanceof ImmutableURI;
}

/**
 * Assert that an unknown value is a URI object.
 *
 * @param value The value to assert.
 * @param caller Function to attribute a thrown error to (defaults to `assertURI` itself).
 * @throws {RequiredError} If `value` is not a URI object.
 * @see https://shelving.cc/util/uri/assertURI
 */
export function assertURI(value: unknown, caller: AnyCaller = assertURI): asserts value is ImmutableURI {
	if (!isURI(value)) throw new RequiredError("Invalid URI", { received: value, caller });
}

/**
 * Convert a possible URI to a URI, or return `undefined` if conversion fails.
 * - Only inputs that already encode a complete URI succeed — relative inputs return `undefined`. No implicit fallback to the document or window URL.
 * - To resolve a relative ref against a base, use `getBasedURI()` from `url.ts`.
 *
 * @param possible Possible URI value to convert (a nullish value returns `undefined`).
 * @returns Converted `ImmutableURI`, or `undefined` if conversion fails.
 * @example getURI("http://shax.com") // URL { … }
 * @see https://shelving.cc/util/uri/getURI
 */
export function getURI(possible: Nullish<PossibleURI>): ImmutableURI | undefined {
	if (!possible) return;
	if (isURI(possible)) return possible;
	try {
		return new URL(possible) as ImmutableURI;
	} catch {
		//
	}
}

/**
 * Convert a possible URI to a URI, or throw `RequiredError` if conversion fails.
 *
 * @param possible Possible URI value to convert.
 * @param caller Function to attribute a thrown error to (defaults to `requireURI` itself).
 * @returns Converted `ImmutableURI`.
 * @throws {RequiredError} If `possible` cannot be converted to a valid URI.
 * @example requireURI("http://shax.com") // URL { … }
 * @see https://shelving.cc/util/uri/requireURI
 */
export function requireURI(possible: PossibleURI, caller: AnyCaller = requireURI): ImmutableURI {
	const url = getURI(possible);
	assertURI(url, caller);
	return url;
}

/**
 * Type for a set of named URI parameters.
 *
 * @see https://shelving.cc/util/uri/URIParams
 */
export type URIParams = ImmutableDictionary<string>;

/**
 * Type for things that can be converted to named URI parameters.
 *
 * @see https://shelving.cc/util/uri/PossibleURIParams
 */
export type PossibleURIParams = PossibleURI | URLSearchParams | ImmutableDictionary<unknown>;

/**
 * Get a set of entries for a set of possible URI params.
 *- Any params with `undefined` value will be ignored.
 *
 * Note: Not as simple as just converting with `Object.fromEntries()`:
 * 1. When `URLSearchParams` contains multiple values for the same key, calling `params.get()` will return the _first_ value.
 * 2. So when converting this to a simple data object, only one value per key can be represented, but it needs to be the _first_ one.
 * 3. Since we're looping through anyway, we also take the time to convert values to strings, so we can accept a wider range of input types.
 */
function* getURIEntries(params: PossibleURIParams, caller: AnyCaller = getURIParams): Iterable<DictionaryItem<string>> {
	if (params instanceof URLSearchParams) {
		yield* params;
	} else if (isString(params) || params instanceof URL) {
		yield* requireURI(params, caller).searchParams;
	} else {
		const done: MutableArray<string> = [];
		for (const [key, value] of getDictionaryItems(params)) {
			if (value === undefined) continue; // Skip undefined.
			if (done.includes(key)) continue;
			done.push(key);
			const str = getString(value);
			if (str === undefined) throw new ValueError(`URI param "${key}" must be string`, { received: value, caller });
			yield [key, str];
		}
	}
}

/**
 * Get a set of params for a URI as a dictionary.
 * - Any params with `undefined` value will be ignored.
 *
 * @param params Possible URI params to convert.
 * @param caller Function to attribute a thrown error to (defaults to `getURIParams` itself).
 * @returns Dictionary of string params keyed by name.
 * @throws {RequiredError} If `params` is a string or URL that cannot be converted to a valid URI.
 * @throws {ValueError} If any param value cannot be converted to a string.
 * @example getURIParams("http://x.com?a=1&b=2") // { a: "1", b: "2" }
 * @see https://shelving.cc/util/uri/getURIParams
 */
export function getURIParams(params: PossibleURIParams, caller: AnyCaller = getURIParams): URIParams {
	const output: MutableDictionary<string> = {};
	for (const [key, str] of getURIEntries(params, caller)) output[key] = str;
	return output;
}

/** Get a single named param from a URI. */
export function getURIParam(params: PossibleURIParams, key: string): string | undefined {
	if (params instanceof URLSearchParams) return params.get(key) || undefined;
	if (isDictionary(params)) return getString(params[key]);
	return getURIParams(params)[key];
}

/** Get a single named param from a URI. */
export function requireURIParam(params: PossibleURIParams, key: string, caller: AnyCaller = requireURIParam): string {
	const value = getURIParam(params, key);
	if (value === undefined) throw new RequiredError(`URI param "${key}" is required`, { received: params, caller });
	return value;
}

/**
 * Return a URI with a new param set (or same URI if no changes were made).
 * - Any params with `undefined` value will be ignored.
 *
 * @throws `ValueError` if the value could not be converted to a string.
 */
export function withURIParam(uri: ImmutableURL | URLString, key: string, value: unknown, caller?: AnyCaller): ImmutableURL;
export function withURIParam(uri: PossibleURI, key: string, value: unknown, caller?: AnyCaller): ImmutableURI;
export function withURIParam(uri: PossibleURI, key: string, value: unknown, caller: AnyCaller = withURIParam): ImmutableURI {
	const input = requireURI(uri, caller);
	if (value === undefined) return input; // Ignore undefined.
	const output = new ImmutableURI(input);
	const str = getString(value);
	if (str === undefined) throw new ValueError(`URI param "${key}" must be string`, { received: value, caller });
	output.searchParams.set(key, str);
	return input.href === output.href ? input : output;
}

/**
 * Return a URI with several new params set (or same URI if no changes were made).
 * - Any params with `undefined` value will be ignored.
 *
 * @param params A set of possible URI params.
 * - If `params` is `null` or `undefined` the same input URL will be returned.
 *
 * @throws `ValueError` if any of the values could not be converted to strings.
 */
export function withURIParams(uri: ImmutableURL | URLString, params: Nullish<PossibleURIParams>, caller?: AnyCaller): ImmutableURL;
export function withURIParams(uri: PossibleURI, params: Nullish<PossibleURIParams>, caller?: AnyCaller): ImmutableURI;
export function withURIParams(uri: PossibleURI, params: Nullish<PossibleURIParams>, caller: AnyCaller = withURIParams): ImmutableURI {
	const input = requireURI(uri, caller);
	if (!params) return input;
	const output = new ImmutableURI(input);
	for (const [key, str] of getURIEntries(params, caller)) output.searchParams.set(key, str);
	return input.href === output.href ? input : output;
}

/**
 * Return a URI without one or more params (or same URI if no changes were made).
 */
export function omitURIParams(uri: ImmutableURL | URLString, ...keys: string[]): ImmutableURL;
export function omitURIParams(uri: PossibleURI, ...keys: string[]): ImmutableURI;
export function omitURIParams(uri: PossibleURI, ...keys: string[]): ImmutableURI {
	const input = requireURI(uri, omitURIParams);
	if (!keys.length) return input;
	const output = new ImmutableURI(input);
	for (const key of keys) output.searchParams.delete(key);
	return input.href === output.href ? input : output;
}

/** Return a URI without a param (or same URI if no changes were made). */
export const omitURIParam: (uri: PossibleURI, key: string) => ImmutableURI = omitURIParams;

/** Return a URI with no search params (or same URI if no changes were made). */
export function clearURIParams(uri: ImmutableURL | URLString, caller?: AnyCaller): ImmutableURL;
export function clearURIParams(uri: PossibleURI, caller?: AnyCaller): ImmutableURI;
export function clearURIParams(uri: PossibleURI, caller: AnyCaller = clearURIParams): ImmutableURI {
	const input = requireURI(uri, caller);
	if (!input.search.length) return input;
	const output = new URL(input);
	output.search = "";
	return output as ImmutableURI;
}

/** A single schema for a URL. */
export type URIScheme = `${string}:`;

/** List of allowed URI schemes. */
export type URISchemes = ImmutableArray<URIScheme>;

/** Valid HTTP schemes for a URI. */
export const HTTP_SCHEMES: URISchemes = ["http:", "https:"];
