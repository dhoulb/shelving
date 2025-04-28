import { AssertionError } from "../error/AssertionError.js";
import { RequiredError } from "../error/RequiredError.js";
import type { AnyFunction } from "./function.js";
import { type Optional, notOptional } from "./optional.js";

/** Things that can be converted to a URL instance. */
export type PossibleURL = string | URL;

/** Is an unknown value a URL object? */
export function isURL(value: unknown): value is URL {
	return value instanceof URL;
}

/** Assert that an unknown value is a URL object. */
export function assertURL(value: unknown): asserts value is URL {
	if (!isURL(value)) throw new AssertionError("Invalid URL", { received: value, caller: assertURL });
}

/** Convert a possible URL to a URL, or return `undefined` if conversion fails. */
export function getOptionalURL(possible: Optional<PossibleURL>, base: PossibleURL | undefined = _BASE): URL | undefined {
	if (notOptional(possible)) {
		try {
			return isURL(possible) ? possible : new URL(possible, base);
		} catch (e) {
			//
		}
	}
}
const _BASE = typeof document === "object" ? document.baseURI : undefined;

/** Convert a possible URL to a URL, or throw `AssertionError` if conversion fails. */
export function requireURL(possible: PossibleURL, base?: PossibleURL): URL {
	return _url(requireURL, possible, base);
}
function _url(caller: AnyFunction, possible: PossibleURL, base: PossibleURL | undefined): URL {
	const url = getOptionalURL(possible, base);
	if (!url) throw new RequiredError("Invalid URL", { received: possible, caller: requireURL });
	return url;
}

/** Just get the important part of a URL, e.g. `http://shax.com/test?uid=129483` → `shax.com/test` */
export function formatURL(possible: PossibleURL, base?: PossibleURL): string {
	const { host, pathname } = _url(formatURL, possible, base);
	return `${host}${pathname.length > 1 ? pathname : ""}`;
}
