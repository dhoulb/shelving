import type { ReactElement } from "react";
import { formatURI } from "../../util/format.js";
import { getRegExp } from "../../util/regexp.js";
import type { MarkupParser } from "../MarkupParser.js";
import { createMarkupRule } from "../MarkupRule.js";

type LinkData = {
	title?: string;
	href: string;
};

type AutolinkData = {
	title?: string;
	angled?: string;
	href?: string;
};

/** Render `<a href="">` if the link is a valid one, or `<a>` (with no `href`) if it isn't. */
function _renderLink(key: string, { title, href }: LinkData, parser: MarkupParser): ReactElement {
	const link = parser.getLink(href);
	return (
		<a key={key} href={link?.href} rel={parser.rel}>
			{title ? parser.parse(title, "link") : link ? formatURI(link, _renderLink) : ""}
		</a>
	);
}

/**
 * Markdown-style link.
 * - Link in standard Markdown format, e.g. `[Google Maps](http://google.com/maps)`
 * - If no title is specified a cleaned up version of the URL will be used, e.g. `google.com/maps`
 * - Does not need space before/after the link.
 * - If link is not valid (using `new URL(url)` then unparsed text will be returned.
 * - For security only schemes that appear in `MarkupOptions.schemes` will match (defaults to `http:` and `https:`).
 *
 * @example new MarkupParser({ rules: [LINK_RULE] }).parse("[Google Maps](http://google.com/maps)")
 * @see https://shelving.cc/markup/LINK_RULE
 */
export const LINK_RULE = createMarkupRule<LinkData>(
	getRegExp(/\[(?<title>[^\]\n]*?)\]\((?<href>[^)\n]*?)\)/), //
	_renderLink,
	["inline", "list"],
);

/** Render an autolink from whichever of its two URL forms matched. */
function _renderAutolink(key: string, { angled, href = "", ...data }: AutolinkData, parser: MarkupParser): ReactElement {
	return _renderLink(key, { ...data, href: angled ?? href }, parser);
}

/**
 * Autolinked URL starts with `scheme:` (any scheme in `MarkupOptions.schemes`) and matches an unlimited number of non-space characters (except `<` and `>`).
 * - URL can be wrapped in `<>` angle brackets (the standard Markdown autolink syntax), e.g. `<http://google.com/maps>`. The brackets are not part of the link.
 * - If followed by space and then text in `()` round or `[]` square brackets that will be used as the title, e.g. `http://google.com/maps (Google Maps)` or `http://google.com/maps [Google Maps]` (this syntax is from Todoist and maybe other things too).
 * - If no title is specified a cleaned up version of the URL will be used, e.g. `google.com/maps`
 * - If link is not valid (using `new URL(url)` then unparsed text will be returned.
 * - For security only schemes that appear in `MarkupOptions.schemes` will match (defaults to `http:` and `https:`).
 *
 * @example new MarkupParser({ rules: [AUTOLINK_RULE] }).parse("http://google.com/maps (Google Maps)")
 * @see https://shelving.cc/markup/AUTOLINK_RULE
 */
export const AUTOLINK_RULE = createMarkupRule<AutolinkData>(
	// Scheme length is bounded (`{3,64}?`) so a long run of letters with no `:` can't force O(n²) backtracking.
	getRegExp(/(?:<(?<angled>[a-z]{3,64}?:[^\s<>]+)>|(?<href>[a-z]{3,64}?:[^\s<>]+))(?: +(?:\((?<title>[^)\n]*?)\)))?/), //
	_renderAutolink,
	["inline", "list"],
);
