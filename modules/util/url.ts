import { ValueError } from "../error/ValueError.js";
import { type Optional, notOptional } from "./optional.js";

/** Things that can be converted to a URL instance. */
export type PossibleURL = string | URL;

/** Is an unknown value a URL object? */
export function isURL(value: unknown): value is URL {
	return value instanceof URL;
}

/** Assert that an unknown value is a URL object. */
export function assertURL(value: unknown): asserts value is URL {
	if (!isURL(value)) throw new ValueError("Invalid URL", value);
}

/** Convert a possible URL to a URL or return `undefined` if conversion fails. */
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

/** Convert a possible URL to a URL but throw `ValueError` if conversion fails. */
export function getURL(possible: PossibleURL, base?: PossibleURL): URL {
	const url = getOptionalURL(possible, base);
	if (!url) throw new ValueError("Invalid URL", possible);
	return url;
}

/** Just get the important part of a URL, e.g. `http://shax.com/test?uid=129483` → `shax.com/test` */
export function formatURL(possible: PossibleURL, base?: PossibleURL): string {
	const { host, pathname } = getURL(possible, base);
	return `${host}${pathname.length > 1 ? pathname : ""}`;
}
