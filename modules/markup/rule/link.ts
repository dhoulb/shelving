import { formatURI } from "../../util/format.js";
import type { JSXElement } from "../../util/jsx.js";
import { getRegExp, type NamedRegExpExecArray } from "../../util/regexp.js";
import { getURI, HTTP_SCHEMES } from "../../util/uri.js";
import { getURL } from "../../util/url.js";
import { renderMarkup } from "../render.js";
import { REACT_ELEMENT_TYPE } from "../util/internal.js";
import type { MarkupOptions } from "../util/options.js";
import { getMarkupRule } from "../util/rule.js";

type LinkMarkupRuleData = { title?: string; href: string };

/** Render `<a href="">` if the link is a valid one, or `<a>` (with no `href`) if it isn't. */
function renderLinkMarkupRule(
	{ groups: { title, href: unsafeHref } }: NamedRegExpExecArray<LinkMarkupRuleData>,
	options: MarkupOptions,
	key: string,
): JSXElement {
	const { base, schemes = HTTP_SCHEMES, rel } = options;
	const uri = getURL(unsafeHref, base) ?? getURI(unsafeHref);
	const href = uri && schemes.includes(uri.protocol) ? uri.href : undefined;
	const children = title ? renderMarkup(title, options, "link") : uri ? formatURI(uri) : "";
	return {
		key,
		$$typeof: REACT_ELEMENT_TYPE,
		type: "a",
		props: { href, rel, children },
	};
}

export const LINK_REGEXP = getRegExp<LinkMarkupRuleData>(/\[(?<title>[^\]\n]*?)\]\((?<href>[^)\n]*?)\)/);

/**
 * Markdown-style link.
 * - Link in standard Markdown format, e.g. `[Google Maps](http://google.com/maps)`
 * - If no title is specified a cleaned up version of the URL will be used, e.g. `google.com/maps`
 * - Does not need space before/after the link.
 * - If link is not valid (using `new URL(url)` then unparsed text will be returned.
 * - For security only `http://` or `https://` links will work (if invalid the unparsed text will be returned).
 */
export const LINK_RULE = getMarkupRule(
	LINK_REGEXP, //
	renderLinkMarkupRule,
	["inline", "list"],
);

export const AUTOLINK_REGEXP = getRegExp<LinkMarkupRuleData>(/(?<href>[a-z]{2,}:\S+)(?: +(?:\((?<title>[^)\n]*?)\)))?/);

/**
 * Autolinked URL starts with `scheme://` (any scheme in `options.schemes`) and matches an unlimited number of non-space characters.
 * - If followed by space and then text in `()` round or `[]` square brackets that will be used as the title, e.g. `http://google.com/maps (Google Maps)` or `http://google.com/maps [Google Maps]` (this syntax is from Todoist and maybe other things too).
 * - If no title is specified a cleaned up version of the URL will be used, e.g. `google.com/maps`
 * - If link is not valid (using `new URL(url)` then unparsed text will be returned.
 * - For security only schemes that appear in `options.schemes` will match (defaults to `http:` and `https:`).
 */
export const AUTOLINK_RULE = getMarkupRule(
	AUTOLINK_REGEXP, //
	renderLinkMarkupRule,
	["inline", "list"],
);
