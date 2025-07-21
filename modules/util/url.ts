import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";
import { type Optional, notOptional } from "./optional.js";

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
export function getURL(possible: Optional<PossibleURL>, base: PossibleURL | undefined = _BASE): URL | undefined {
	if (notOptional(possible)) {
		try {
			return isURL(possible) ? possible : new URL(possible, base);
		} catch (e) {
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
