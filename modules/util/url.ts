import { ValueError } from "../error/ValueError.js";
import { type Optional, notOptional } from "./optional.js";
import { type AbsolutePath, isAbsolutePath } from "./path.js";

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
export function getOptionalURL(possible: Optional<PossibleURL>, base: AbsoluteURI | AbsoluteURL | undefined = _BASE): URL | undefined {
	if (notOptional(possible)) {
		try {
			return isURL(possible) ? possible : new URL(possible, base);
		} catch (e) {
			//
		}
	}
}
const _BASE = typeof document === "object" ? (document.baseURI as AbsoluteURI) : undefined;

/** Convert a possible URL to a URL but throw `ValueError` if conversion fails. */
export function getURL(possible: PossibleURL, base?: AbsoluteURI | AbsoluteURL): URL {
	const url = getOptionalURL(possible, base);
	if (!url) throw new ValueError("Invalid URL", possible);
	return url;
}

/** Just get the important part of a URL, e.g. `http://shax.com/test?uid=129483` → `shax.com/test` */
export function formatURL(possible: PossibleURL, base?: AbsoluteURL | AbsoluteURI): string {
	const { host, pathname } = getURL(possible, base);
	return `${host}${pathname.length > 1 ? pathname : ""}`;
}

/**
 * Absolute URL is a URL that has an absolute `href` and `pathname` properties.
 * - e.g. `http://x.com/a/b` is an absolute URL because `.pathname` will be `/a/b`
 * - e.g. `http://x.com` is an absolute URL because `.pathname` will be `/`
 * - e.g. `mailto:me@gmail.com` is _not_ an absolute URL because `.pathname` will be `"me@gmail.com"` which does not start with `/` slash.
 */
export type AbsoluteURL = URL & { href: AbsoluteURI; pathname: AbsolutePath };

/** Is an unknown value an absolute URL object? */
export function isAbsoluteURL(value: unknown): value is AbsoluteURL {
	// Is an absolute URL if it's a URL and has both a protocol (e.g. `http:`) and a path starting with `/`
	// Heirarchical URIs like `http:` and `ftp:` will always have pathname starting with `/`
	return isURL(value) && !!value.protocol && isAbsolutePath(value.pathname);
}

/** Convert a possible URL to a URL or return `undefined` if conversion fails. */
export function getOptionalAbsoluteURL(possible: Optional<PossibleURL>, base?: AbsoluteURL | AbsoluteURI): AbsoluteURL | undefined {
	const url = getOptionalURL(possible, base);
	if (isAbsoluteURL(url)) return url;
}

/** Convert a possible URL to a URL or return `undefined` if conversion fails. */
export function getAbsoluteURL(possible: Optional<PossibleURL>, base?: AbsoluteURL | AbsoluteURI): AbsoluteURL | undefined {
	const url = getOptionalAbsoluteURL(possible, base);
	if (!url) throw new ValueError("Invalid absolute URL", possible);
	return url;
}

/**
 * Absolute URI string starting with e.g. `https://`
 * - Indicates a URI with `://` e.g. `https://` and `ftp://` and `file://`
 * - Does not allow non-heirarchical URIs like `mailto:me@gmail.com`
 */
export type AbsoluteURI = `${string}://${string}`;

/** Relative URI string starts with `./` or `../` or `/` */
export type RelativeURI = `.` | `./${string}` | `..` | `../${string}` | `/` | `/${string}`;

/** Either an absolute URI string or a relative URI string. */
export type URI = AbsoluteURI | RelativeURI;

/** Convert a possible URL to a absolute URI string or return `undefined` if conversion fails. */
export function getOptionalAbsoluteURI(possible: Optional<PossibleURL>, base?: AbsoluteURL | AbsoluteURI): AbsoluteURI | undefined {
	return getOptionalAbsoluteURL(possible, base)?.href;
}

/** Convert a possible URL to an absolute URI string. */
export function getAbsoluteURI(possible: PossibleURL, base?: AbsoluteURL | AbsoluteURI): AbsoluteURI {
	const link = getOptionalAbsoluteURI(possible, base);
	if (!link) throw new ValueError("Invalid link", possible);
	return link;
}
