import { ValueError } from "../error/ValueError.js";
import type { ImmutableArray } from "./array.js";
import type { Optional } from "./optional.js";
import type { Path } from "./path.js";
import { type PossibleURL, getOptionalURL, isURL } from "./url.js";

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

/** Is an unknown value a URL object with an absolute path component? */
export function isLinkURL(value: unknown): value is AbsoluteLinkURL {
	return isURL(value) && !!value.protocol;
}

/** Convert a possible URL to a URL or return `undefined` if conversion fails. */
export function getLinkURL(
	possible: Optional<PossibleURL>,
	base?: AbsoluteLinkURL | AbsoluteLink,
	schemes: LinkSchemes = SCHEMES,
	hosts?: LinkHosts,
): AbsoluteLinkURL | undefined {
	const url = getOptionalURL(possible, base);
	if (url && schemes.includes(url.protocol) && (!hosts || hosts.includes(url.host))) return url as AbsoluteLinkURL;
}

/** Convert a possible URL to a URL or return `undefined` if conversion fails. */
export function requireLinkURL(
	possible: PossibleURL,
	base?: AbsoluteLinkURL | AbsoluteLink,
	schemes?: LinkSchemes,
	hosts?: LinkHosts,
): AbsoluteLinkURL {
	const url = getLinkURL(possible, base, schemes, hosts);
	if (!url) throw new ValueError("Invalid link", { received: possible, caller: requireLinkURL });
	return url;
}

/** Convert a possible URL to a absolute URL string or return `undefined` if conversion fails. */
export function getLink(
	possible: Optional<PossibleURL>,
	base?: AbsoluteLinkURL | AbsoluteLink,
	schemes: LinkSchemes = SCHEMES,
	hosts?: LinkHosts,
): AbsoluteLink | undefined {
	const url = getOptionalURL(possible, base);
	if (url && schemes.includes(url.protocol) && (!hosts || hosts.includes(url.host))) return url.href as AbsoluteLink;
}

/** Convert a possible URL to an absolute URL string. */
export function requireLink(
	possible: PossibleURL,
	base?: AbsoluteLinkURL | AbsoluteLink,
	schemes?: LinkSchemes,
	hosts?: LinkHosts,
): AbsoluteLink {
	return requireLinkURL(possible, base, schemes, hosts).href;
}
