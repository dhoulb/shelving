import type { ReactElement } from "react";
import { formatURI } from "../../util/format.js";
import { getLink } from "../../util/link.js";
import { getRegExp } from "../../util/regexp.js";
import type { MarkupParser } from "../MarkupParser.js";
import { createMarkupRule } from "../MarkupRule.js";

type LinkData = {
	title?: string;
	href: string;
};

/** Render `<a href="">` if the link is a valid one, or `<a>` (with no `href`) if it isn't. */
function renderLinkMarkupRule(key: string, { title, href: unsafeHref }: LinkData, parser: MarkupParser): ReactElement {
	const { url, root, schemes, rel } = parser;
	const link = getLink(unsafeHref, url, root);
	const href = link && schemes.includes(link.protocol) ? link?.href : undefined;
	const children = title ? parser.parse(title, "link") : link ? formatURI(link) : "";
	return (
		<a key={key} href={href} rel={rel}>
			{children}
		</a>
	);
}

export const LINK_REGEXP = getRegExp<LinkData>(/\[(?<title>[^\]\n]*?)\]\((?<href>[^)\n]*?)\)/);

/**
 * Markdown-style link.
 * - Link in standard Markdown format, e.g. `[Google Maps](http://google.com/maps)`
 * - If no title is specified a cleaned up version of the URL will be used, e.g. `google.com/maps`
 * - Does not need space before/after the link.
 * - If link is not valid (using `new URL(url)` then unparsed text will be returned.
 * - For security only `http://` or `https://` links will work (if invalid the unparsed text will be returned).
 */
export const LINK_RULE = createMarkupRule<LinkData>(
	LINK_REGEXP, //
	renderLinkMarkupRule,
	["inline", "list"],
);

export const AUTOLINK_REGEXP = getRegExp<LinkData>(/(?<href>[a-z]{2,}:\S+)(?: +(?:\((?<title>[^)\n]*?)\)))?/);

/**
 * Autolinked URL starts with `scheme://` (any scheme in `options.schemes`) and matches an unlimited number of non-space characters.
 * - If followed by space and then text in `()` round or `[]` square brackets that will be used as the title, e.g. `http://google.com/maps (Google Maps)` or `http://google.com/maps [Google Maps]` (this syntax is from Todoist and maybe other things too).
 * - If no title is specified a cleaned up version of the URL will be used, e.g. `google.com/maps`
 * - If link is not valid (using `new URL(url)` then unparsed text will be returned.
 * - For security only schemes that appear in `options.schemes` will match (defaults to `http:` and `https:`).
 */
export const AUTOLINK_RULE = createMarkupRule<LinkData>(
	AUTOLINK_REGEXP, //
	renderLinkMarkupRule,
	["inline", "list"],
);
