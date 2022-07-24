import { AssertionError } from "../error/AssertionError.js";

/** Things that can be converted to a URL instance. */
export type PossibleURL = string | URL;
export type PossibleOptionalURL = PossibleURL | null;

/** Convert a possible URL to a URL or return `null` if conversion fails. */
export function getOptionalURL(url: PossibleOptionalURL, base: PossibleOptionalURL = typeof window === "object" ? window.location.href : null): URL | null {
	if (url instanceof URL) return url;
	if (!url) return null;
	try {
		return new URL(url, base || undefined);
	} catch (e) {
		return null;
	}
}

/** Assert that an unknown value is a URL. */
export function assertURL(v: unknown): asserts v is URL {
	if (!(v instanceof URL)) throw new AssertionError("Invalid URL", v);
}

/** Convert a possible URL to a URL but throw `AssertionError` if conversion fails. */
export function getURL(input: PossibleURL, base?: PossibleOptionalURL): URL {
	const url = getOptionalURL(input, base);
	if (!(url instanceof URL)) throw new AssertionError("Invalid URL", input);
	return url;
}

/** Just get important part of a URL, e.g. `http://shax.com/test?uid=129483` → `shax.com/test` */
export const formatUrl = (url: PossibleURL): string => {
	const { host, pathname } = getURL(url);
	return `${host}${pathname.length > 1 ? pathname : ""}`;
};
