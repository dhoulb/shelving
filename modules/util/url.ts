import { RequiredError } from "../error/RequiredError.js";
import type { Data } from "./data.js";
import type { ImmutableDictionary, MutableDictionary } from "./dictionary.js";
import type { AnyCaller } from "./function.js";
import { type Nullish, notNullish } from "./null.js";
import { getProps } from "./object.js";
import { requireString } from "./string.js";

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
	if (notNullish(possible)) {
		try {
			return isURL(possible) ? possible : new URL(possible, base);
		} catch (_e) {
			//
		}
	}
}
const _BASE = typeof document === "object" ? document.baseURI : undefined;

/** Convert a possible URL to a URL, or throw `RequiredError` if conversion fails. */
export function requireURL(possible: PossibleURL, base?: PossibleURL, caller: AnyCaller = requireURL): URL {
	const url = getURL(possible, base);
	assertURL(url, caller);
	return url;
}

/**
 * Get the params of a URL as a dictionary of strings.
 * - Note: The same param cannot exist multiple times in the returned dictionary, so the first value for a param will be used (which matches `URLSearchParams.get()` behavior).
 */
export function getURLParams(params: URLSearchParams): ImmutableDictionary<string> {
	const output: MutableDictionary<string> = {};
	for (const [key, value] of params) if (!Object.hasOwn(output, key)) output[key] = value;
	return output;
}

/** Get a param from a URL. */
export function getURLParam(params: URLSearchParams, key: string): string | undefined {
	return params.get(key) || undefined;
}

/** Get a param from a URL. */
export function requireURLParam(params: URLSearchParams, key: string, caller: AnyCaller = requireURLParam): string | undefined {
	const value = params.get(key);
	if (value === null) throw new RequiredError(`URL param "${key}" is required`, { received: params.toString(), caller });
	return value;
}

/** Return a URL with a new param set (or same URL if no changes were made). */
export function withURLParam(url: PossibleURL, key: string, value: unknown, caller: AnyCaller = withURLParam): URL {
	const input = requireURL(url);
	const output = new URL(input);
	output.searchParams.set(key, requireString(value as string, undefined, undefined, caller));
	return input.href === output.href ? input : output;
}

/** Return a URL with several new params set (or same URL if no changes were made). */
export function withURLParams(url: PossibleURL, params: Data, caller: AnyCaller = withURLParams): URL {
	const input = requireURL(url);
	const output = requireURL(url);
	for (const [key, value] of getProps(params)) output.searchParams.set(key, requireString(value as string, undefined, undefined, caller));
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
