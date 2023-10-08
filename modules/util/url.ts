import { AssertionError } from "../error/AssertionError.js";
import { type Optional, notOptional } from "./optional.js";

/** Things that can be converted to a URL instance. */
export type PossibleURL = string | URL;

/** Is an unknown value a URL? */
export const isURL = (value: unknown): value is URL => value instanceof URL;

/** Assert that an unknown value is a URL. */
export function assertURL(value: unknown): asserts value is URL {
	if (!isURL(value)) throw new AssertionError("Invalid URL", value);
}

/** Convert a possible URL to a URL or return `null` if conversion fails. */
export function getOptionalURL(url: Optional<PossibleURL>, base: PossibleURL | Location | undefined = _LOCATION): URL | undefined {
	if (notOptional(url)) {
		if (isURL(url)) return url;
		try {
			return new URL(url, base as PossibleURL | undefined); // DH: We know `Location` works in URL constructor.
		} catch (e) {
			//
		}
	}
}
const _LOCATION = typeof window === "object" ? window.location : undefined;

/** Convert a possible URL to a URL but throw `AssertionError` if conversion fails. */
export function getURL(possibleURL: PossibleURL, base?: PossibleURL): URL {
	const url = getOptionalURL(possibleURL, base);
	if (!url) throw new AssertionError("Invalid URL", possibleURL);
	return url;
}

/** Just get important part of a URL, e.g. `http://shax.com/test?uid=129483` → `shax.com/test` */
export function formatURL(possibleURL: PossibleURL, base?: PossibleURL): string {
	const { host, pathname } = getURL(possibleURL, base);
	return `${host}${pathname.length > 1 ? pathname : ""}`;
}
