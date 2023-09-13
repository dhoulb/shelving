import { AssertionError } from "../error/AssertionError.js";

/** Things that can be converted to a URL instance. */
export type PossibleURL = string | URL;
export type PossibleOptionalURL = PossibleURL | null;

/** Is an unknown value a URL? */
export const isURL = (value: unknown): value is URL => value instanceof URL;

/** Assert that an unknown value is a URL. */
export function assertURL(value: unknown): asserts value is URL {
	if (!isURL(value)) throw new AssertionError("Invalid URL", value);
}

/** Convert a possible URL to a URL or return `null` if conversion fails. */
export function getOptionalURL(url: PossibleOptionalURL, base: PossibleOptionalURL = typeof window === "object" ? window.location.href : null): URL | null {
	if (!url) return null;
	if (isURL(url)) return url;
	try {
		return new URL(url, base || undefined);
	} catch (e) {
		return null;
	}
}

/** Convert a possible URL to a URL but throw `AssertionError` if conversion fails. */
export function getURL(possibleURL: PossibleURL, base?: PossibleOptionalURL): URL {
	const url = getOptionalURL(possibleURL, base);
	if (!url) throw new AssertionError("Invalid URL", possibleURL);
	return url;
}

/** Just get important part of a URL, e.g. `http://shax.com/test?uid=129483` → `shax.com/test` */
export function formatURL(possibleURL: PossibleURL, base?: PossibleOptionalURL): string {
	const { host, pathname } = getURL(possibleURL, base);
	return `${host}${pathname.length > 1 ? pathname : ""}`;
}
