import type { ImmutableArray } from "./array.js";
import type { Optional } from "./optional.js";
import { ValueError } from "../error/ValueError.js";
import { type AbsolutePath } from "./path.js";
import { type PossibleURL, getOptionalURL, isURL } from "./url.js";

/** Default whitelist for URL schemes. */
const _SCHEMES = ["http:", "https:"];

/** List of allowed schemes for a link. */
export type LinkSchemes = ImmutableArray<string>;

/** List of allowed hosts for a link. */
export type LinkHosts = ImmutableArray<string>;

/**
 * URL string with a `scheme:` at the start and a path component, e.g. `https://` or `file://`
 * - The `//` in a URI indicates that type of URI has a path heirarchy indicated by the first `/` after the `://`
 * - If the URI has no explicit `/path` component it will always be assumed to be `/`
 * - Some URIs are non-heirarchical, e.g. `mailto:me@gmail.com`
 */
export type Link = `${string}:${string}`;

/**
 * Link URL is a URL that has an `href` that is a `Link` element and a `pathname` that is an `AbsolutePath` property.
 * - e.g. `http://x.com/a/b` is a link URL because `.pathname` will be `/a/b`
 * - e.g. `http://x.com` is a link URL because `.pathname` will be `/`
 * - e.g. `mailto:me@gmail.com` is _not_ an absolute URL because `.pathname` will be `"me@gmail.com"` which does not start with `/` slash.
 */
export type LinkURL = URL & { href: Link; pathname: AbsolutePath };

/** Is an unknown value a URL object with an absolute path component? */
export function isLinkURL(value: unknown): value is LinkURL {
	return isURL(value) && !!value.protocol;
}

/** Convert a possible URL to a URL or return `undefined` if conversion fails. */
export function getOptionalLinkURL(possible: Optional<PossibleURL>, base?: LinkURL | Link, schemes: LinkSchemes = _SCHEMES, hosts?: LinkHosts): LinkURL | undefined {
	const url = getOptionalURL(possible, base);
	if (url && schemes.includes(url.protocol) && (!hosts || hosts.includes(url.host))) return url as LinkURL;
}

/** Convert a possible URL to a URL or return `undefined` if conversion fails. */
export function getLinkURL(possible: PossibleURL, base?: LinkURL | Link, schemes?: LinkSchemes, hosts?: LinkHosts): LinkURL {
	const url = getOptionalLinkURL(possible, base, schemes, hosts);
	if (!url) throw new ValueError("Invalid link", possible);
	return url;
}

/** Convert a possible URL to a absolute URL string or return `undefined` if conversion fails. */
export function getOptionalLink(possible: Optional<PossibleURL>, base?: LinkURL | Link, schemes: LinkSchemes = _SCHEMES, hosts?: LinkHosts): Link | undefined {
	const url = getOptionalURL(possible, base);
	if (url && schemes.includes(url.protocol) && (!hosts || hosts.includes(url.host))) return url.href as Link;
}

/** Convert a possible URL to an absolute URL string. */
export function getLink(possible: PossibleURL, base?: LinkURL | Link, schemes?: LinkSchemes, hosts?: LinkHosts): Link {
	return getLinkURL(possible, base, schemes, hosts).href;
}
