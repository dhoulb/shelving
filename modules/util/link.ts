import { RequiredError } from "../error/RequiredError.js";
import type { ImmutableArray } from "./array.js";
import type { AnyCaller } from "./function.js";
import type { Nullish } from "./null.js";
import type { Path } from "./path.js";
import { type PossibleURL, getURL, isURL } from "./url.js";

/** Default whitelist for URL schemes. */
const SCHEMES: readonly string[] = ["http:", "https:"];

/**
 * URL string with a `scheme:` at the start and a path component, e.g. `https://` or `file://`
 * - The `//` in a URI indicates that type of URI has a path heirarchy indicated by the first `/` after the `://`
 * - If the URI has no explicit `/path` component it will always be assumed to be `/`
 * - Some URIs are non-heirarchical, e.g. `mailto:me@gmail.com`
 */
export type AbsoluteLink = `${string}:${string}`;

/**
 * Relative link starts with `./` or `../` or `/`
 * @example "/a/b/c"
 * @example "./d/e/f"
 * @example "../g/h/i"
 */
export type RelativeLink = Path;

/**
 * Either an absolute URL string or a relative URL string.
 * @example "http://www.google.com"
 * @example "/a/b/c"
 * @example "./d/e/f"
 * @example "../g/h/i"
 */
export type Link = AbsoluteLink | RelativeLink;

/**
 * List of allowed schemes for a link.
 * @example ["http:", "https:", "mailto:"]
 */
export type LinkSchemes = ImmutableArray<string>;

/**
 * List of allowed hosts for a link.
 * @example ["google.com", "www.google.com"]
 */
export type LinkHosts = ImmutableArray<string>;

/**
 * Absolute URL is a URL that has an `href` that is a `Link` element and a `pathname` that is an `AbsolutePath` property.
 * - e.g. `http://x.com/a/b` is a link URL because `.pathname` will be `/a/b`
 * - e.g. `http://x.com` is a link URL because `.pathname` will be `/`
 * - e.g. `mailto:me@gmail.com` is _not_ an absolute URL because `.pathname` will be `"me@gmail.com"` which does not start with `/` slash.
 */
export type AbsoluteLinkURL = URL & { href: AbsoluteLink };

/**
 * Is an unknown value a link URL?
 * - A valid link URL is a `URL` instance with a scheme matching the `schemes` array, and `host` matching the optional `hosts` array.
 */
export function isLinkURL(value: unknown, schemes: LinkSchemes = SCHEMES, hosts?: LinkHosts): value is AbsoluteLinkURL {
	return isURL(value) && schemes.includes(value.protocol) && (!hosts || hosts.includes(value.host));
}

/**
 * Convert a possible URL to a link URL, or return `undefined` if conversion fails.
 * - A valid link URL is a `URL` instance with a scheme matching the `schemes` array, and `host` matching the optional `hosts` array.
 */
export function getLinkURL(
	value: Nullish<PossibleURL>,
	base?: AbsoluteLinkURL | AbsoluteLink,
	schemes: LinkSchemes = SCHEMES,
	hosts?: LinkHosts,
): AbsoluteLinkURL | undefined {
	const url = getURL(value, base);
	if (isLinkURL(url, schemes, hosts)) return url as AbsoluteLinkURL;
}

/**
 * Convert a possible URL to a link URL, or throw `RequiredError` if conversion fails.
 * - A valid link URL is a `URL` instance with a scheme matching the `schemes` array, and `host` matching the optional `hosts` array.
 */
export function requireLinkURL(
	value: PossibleURL,
	base?: AbsoluteLinkURL | AbsoluteLink,
	schemes?: LinkSchemes,
	hosts?: LinkHosts,
	caller: AnyCaller = requireLinkURL,
): AbsoluteLinkURL {
	const url = getLinkURL(value, base, schemes, hosts);
	if (!url) throw new RequiredError("Invalid link", { received: value, base, schemes, hosts, caller });
	return url;
}

/**
 * Convert a possible URL to an link URL string, or return `undefined` if conversion fails.
 * - A valid link URL string is an absolute URL string with a scheme matching the `schemes` array, and `host` matching the optional `hosts` array.
 */
export function getLink(
	value: Nullish<PossibleURL>,
	base?: AbsoluteLinkURL | AbsoluteLink,
	schemes: LinkSchemes = SCHEMES,
	hosts?: LinkHosts,
): AbsoluteLink | undefined {
	return getLinkURL(value, base, schemes, hosts)?.href;
}

/**
 * Convert a possible URL to an link URL string, or throw `RequiredError` if conversion fails.
 * - A valid link URL string is an absolute URL string with a scheme matching the `schemes` array, and `host` matching the optional `hosts` array.
 */
export function requireLink(
	value: PossibleURL,
	base?: AbsoluteLinkURL | AbsoluteLink,
	schemes?: LinkSchemes,
	hosts?: LinkHosts,
	caller: AnyCaller = requireLink,
): AbsoluteLink {
	return requireLinkURL(value, base, schemes, hosts, caller).href;
}
