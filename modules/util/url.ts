import { RequiredError } from "../error/RequiredError.js";
import { ValueError } from "../error/ValueError.js";
import type { MutableArray } from "./array.js";
import { type Data, isData } from "./data.js";
import type { DictionaryItem, ImmutableDictionary, MutableDictionary } from "./dictionary.js";
import type { AnyCaller } from "./function.js";
import { type Nullish, notNullish } from "./null.js";
import { getProps } from "./object.js";
import { getString, isString } from "./string.js";

/** Values that can be converted to a URL instance. */
export type PossibleURL = string | URL;

/** Is an unknown value a URL object? */
export function isURL(value: unknown): value is URL {
	return value instanceof URL;
}

/** Assert that an unknown value is a URL object. */
export function assertURL(value: unknown, caller: AnyCaller = assertURL): asserts value is URL {
	if (!isURL(value)) throw new RequiredError("Invalid URL", { received: value, caller });
}

/** Convert a possible URL to a URL, or return `undefined` if conversion fails. */
export function getURL(possible: Nullish<PossibleURL>, base: PossibleURL | undefined = _BASE): URL | undefined {
	if (notNullish(possible)) return isURL(possible) ? possible : URL.parse(possible, base) || undefined;
}
const _BASE = typeof document === "object" ? document.baseURI : undefined;

/** Convert a possible URL to a URL, or throw `RequiredError` if conversion fails. */
export function requireURL(possible: PossibleURL, base?: PossibleURL, caller: AnyCaller = requireURL): URL {
	const url = getURL(possible, base);
	assertURL(url, caller);
	return url;
}

/** Type for a set of named URL parameters. */
export type URLParams = ImmutableDictionary<string>;

/** Type for things that can be converted to named URL parameters. */
export type PossibleURLParams = PossibleURL | URLSearchParams | Data | Iterable<DictionaryItem<unknown>>;

/**
 * Get a set of entries for a set of possible URL params.
 *
 * Note: Not as simple as just converting with `Object.fromEntries()`:
 * 1. When `URLSearchParams` contains multiple values for the same key, calling `params.get()` will return the _first_ value.
 * 2. So when converting this to a simple data object, only one value per key can be represented, but it needs to be the _first_ one.
 * 3. Since we're looping through anyway, we also take the time to convert values to strings, so we can accept a wider range of input types.
 */
export function* getURLEntries(input: PossibleURLParams, caller: AnyCaller = getURLParams): Iterable<DictionaryItem<string>> {
	if (input instanceof URLSearchParams) {
		yield* input;
	} else if (isString(input) || isURL(input)) {
		yield* requireURL(input, undefined, caller).searchParams;
	} else {
		const done: MutableArray<string> = [];
		for (const [key, value] of getProps(input)) {
			if (done.includes(key)) continue;
			done.push(key);
			const str = getString(value);
			if (str === undefined) throw new ValueError(`URL param "${key}" must be string`, { received: value, caller });
			yield [key, str];
		}
	}
}

/** Get a set of params for a URL as a dictionary. */
export function getURLParams(input: PossibleURLParams, caller: AnyCaller = getURLParams): URLParams {
	const output: MutableDictionary<string> = {};
	for (const [key, str] of getURLEntries(input, caller)) output[key] = str;
	return output;
}

/** Get a single named param from a URL. */
export function getURLParam(input: PossibleURLParams, key: string): string | undefined {
	if (input instanceof URLSearchParams) return input.get(key) || undefined;
	if (isData(input)) return getString(input[key]);
	return getURLParams(input)[key];
}

/** Get a single named param from a URL. */
export function requireURLParam(input: PossibleURLParams, key: string, caller: AnyCaller = requireURLParam): string {
	const value = getURLParam(input, key);
	if (value === undefined) throw new RequiredError(`URL param "${key}" is required`, { received: input, caller });
	return value;
}

/**
 * Return a URL with a new param set (or same URL if no changes were made).
 * - Throws `ValueError` if the value could not be converted to a string.
 */
export function withURLParam(url: PossibleURL, key: string, value: unknown, caller: AnyCaller = withURLParam): URL {
	const input = requireURL(url);
	const output = new URL(input);
	const str = getString(value);
	if (str === undefined) throw new ValueError(`URL param "${key}" must be string`, { received: value, caller });
	output.searchParams.set(key, str);
	return input.href === output.href ? input : output;
}

/**
 * Return a URL with several new params set (or same URL if no changes were made).
 * - Throws `ValueError` if any of the values could not be converted to strings.
 */
export function withURLParams(url: PossibleURL, params: PossibleURLParams, caller: AnyCaller = withURLParams): URL {
	const input = requireURL(url);
	const output = requireURL(url);
	for (const [key, str] of getURLEntries(params, caller)) output.searchParams.set(key, str);
	return input.href === output.href ? input : output;
}

/** Return a URL without one or more params (or same URL if no changes were made). */
export function omitURLParams(url: PossibleURL, ...keys: string[]): URL {
	const input = requireURL(url);
	const output = requireURL(url);
	for (const key of keys) output.searchParams.delete(key);
	return input.href === output.href ? input : output;
}

/** Return a URL without a param (or same URL if no changes were made). */
export const omitURLParam: (url: PossibleURL, key: string) => URL = omitURLParams;
