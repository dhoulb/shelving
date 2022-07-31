/* eslint-disable import/export */

import type { Data } from "../util/data.js";
import type { JSXElement } from "../util/jsx.js";
import { NamedRegExp, NamedRegExpArray, NamedRegExpData, getRegExp } from "../util/regexp.js";
import { formatURL, getOptionalURL } from "../util/url.js";
import { getBlockRegExp, getLineRegExp, BLOCK_REGEXP, LINE_REGEXP, MarkupMatch, MarkupMatcher, WordRegExp } from "./regexp.js";
import type { MarkupOptions } from "./options.js";

/** Rule for parsing string markup into a JSX element. */
export interface MarkupRule<T extends Data | undefined = Data | undefined> {
	/**
	 * Regular expression or custom matching function.
	 */
	readonly match: (T extends undefined ? RegExp : T extends NamedRegExpData ? NamedRegExp<T> : never) | MarkupMatcher<T>;

	/**
	 * Render the JSX element for this rule using the props matched by
	 */
	readonly render: (orops: T, options: MarkupOptions) => JSXElement;

	/**
	 * Contexts this rule should be applied in,
	 *
	 * @example `["block", "inline", "list"]`
	 */
	readonly contexts: string[];

	/**
	 * Context that children should be rendered with.
	 *
	 * @example `"inline"` // Children of the element rendered by this rule will be parsed against markup rules applied in the "inline" context.
	 */
	readonly subcontext?: string;

	/**
	 * Priority for this rule (defaults to zero).
	 *
	 * @example e.g. `<p>` rule is lower priority than other blocks so it matches last and paragraphs can be interrupted by e.g. `<ul>` and `<blockquote>`.
	 * @example e.g. `<code>` rule is higher priority than other inlines so e.g. `<strong>` or `<em>` don't match inside a code block.
	 */
	readonly priority?: number;
}

/** Any markup rule. */
export type AnyMarkupRule = MarkupRule<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/** A set of markup rules (as an object or array). */
export type MarkupRules = AnyMarkupRule[]; // eslint-disable-line @typescript-eslint/no-explicit-any

/** React security symbol — see https://github.com/facebook/react/pull/4832 */
const $$typeof = Symbol.for("react.element");

/**
 * Headings are single line only (don't allow multiline).
 * - 1-6 hashes then 1+ spaces, then the title.
 * - Same as Markdown syntax.
 * - Markdown's underline syntax is not supported (for simplification).
 */
export const HEADING_RULE: MarkupRule<{ prefix: string; heading: string }> = {
	match: getLineRegExp(`(?<prefix>#{1,6}) +(?<heading>${LINE_REGEXP.source})`) as NamedRegExp<{ prefix: string; heading: string }>,
	render: ({ prefix, heading }) => ({
		type: `h${prefix.length}`,
		key: null,
		ref: null,
		$$typeof,
		props: { children: heading.trim() },
	}),
	contexts: ["block"],
	subcontext: "inline",
};

/**
 * Separator (horizontal rule / thematic break).
 * - Same as Markdown syntax but also allows `•` bullet character (in addition to `-` dash, `+` plus, `*` asterisk, `_` underscore).
 * - Character must be repeated three (or more) times.
 * - Character must be the same every time (can't mix)
 * - Might have infinite number of spaces between the characters.
 */
export const SEPARATOR_RULE: MarkupRule = {
	match: getLineRegExp(`([-*•+_=])(?: *\\1){2,}`),
	render: () => ({
		type: "hr",
		key: null,
		ref: null,
		$$typeof,
		props: {},
	}),
	contexts: ["block"],
};

/**
 * Unordered list.
 * - Roughly the same syntax as Markdown (might be some differences with indenting).
 * - No leading spaces are allowed for the top-level list.
 * - Lists can be created with `•` bullet characters (in addition to `-` dash, `+` plus, and `*` asterisk).
 * - Second-level list can be indented with 1-2 spaces.
 */
const UNORDERED_PREFIX = `[-*•+] +`;
const UNORDERED_SPLIT = new RegExp(`\n+${UNORDERED_PREFIX}`, "g");
const UNORDERED_INDENT = /^\t/gm;
export const UNORDERED_RULE: MarkupRule<{ list: string }> = {
	match: getBlockRegExp(`${UNORDERED_PREFIX}(?<list>${BLOCK_REGEXP.source})`) as NamedRegExp<{ list: string }>,
	render: ({ list }) => ({
		type: "ul",
		key: null,
		ref: null,
		$$typeof,
		props: { children: list.split(UNORDERED_SPLIT).map(_mapUnordered) },
	}),
	contexts: ["block", "list"],
	subcontext: "list",
};
const _mapUnordered = (item: string, key: number): JSXElement => ({
	type: "li",
	key,
	ref: null,
	$$typeof,
	props: { children: item.replace(UNORDERED_INDENT, "") },
});

/**
 * Ordered list.
 * - No leading spaces are allowed for the top-level list.
 * - Second-level list can be indented with 1-3 spaces.
 */
const ORDERED_PREFIX = "[1-9][0-9]{0,8}[.):] +"; // Number for a numbered list, e.g. `1.` or `2)` or `3:`
const ORDERED_SPLIT = new RegExp(`\n+(?=${ORDERED_PREFIX})`, "g");
const ORDERED_INDENT = UNORDERED_INDENT;
export const ORDERED_RULE: MarkupRule<{ list: string }> = {
	match: getBlockRegExp(`(?<list>${ORDERED_PREFIX}${BLOCK_REGEXP.source})`) as NamedRegExp<{ list: string }>,
	render: ({ list }) => ({
		type: "ol",
		key: null,
		ref: null,
		$$typeof,
		props: { children: list.split(ORDERED_SPLIT).map(_mapOrdered) },
	}),
	contexts: ["block", "list"],
	subcontext: "list",
};
const _mapOrdered = (item: string, key: number): JSXElement => ({
	type: "li",
	key,
	ref: null,
	$$typeof,
	props: {
		value: parseInt(item, 10),
		children: item
			.slice(item.indexOf(" ") + 1)
			.trim()
			.replace(ORDERED_INDENT, ""),
	},
});

/**
 * Blockquote block.
 * - Same as Markdown's syntax.
 * - Block continues until it finds a line that doesn't start with `>`
 * - Quote indent symbol can be followed by zero or more spaces.
 */
const BLOCKQUOTE_PREFIX = "> *";
const BLOCKQUOTE_INDENT = new RegExp(`^${BLOCKQUOTE_PREFIX}`, "gm");
export const BLOCKQUOTE_RULE: MarkupRule<{ quote: string }> = {
	match: getLineRegExp(`(?<quote>${BLOCKQUOTE_PREFIX}${LINE_REGEXP.source}(?:\n${BLOCKQUOTE_PREFIX}${LINE_REGEXP.source})*)`) as NamedRegExp<{ quote: string }>,
	render: ({ quote }) => ({
		type: "blockquote",
		key: null,
		ref: null,
		$$typeof,
		props: { children: quote.replace(BLOCKQUOTE_INDENT, "") },
	}),
	contexts: ["block", "list"],
	subcontext: "block",
};

/**
 * Fenced code blocks
 * - Same as Markdown syntax.
 * - Closing fence must be exactly the same as the opening fence, and can be made of at least three "```" backticks or three `~~~` tildes.
 * - If there's no closing fence the code block will run to the end of the current string.
 * - Markdown-style four-space indent syntax is not supported (only fenced code, since it's easier to use).
 */
export const FENCED_CODE_RULE: MarkupRule<{ wrap: string; title?: string; code: string }> = {
	// Matcher has its own end that only stops when it reaches a matching closing fence or the end of the string.
	match: getLineRegExp(`(?<wrap>\`{3,}|~{3,}) *(?<title>${LINE_REGEXP.source})\n(?<code>${BLOCK_REGEXP.source})`, `(?:\n\\k<wrap>|$)`) as NamedRegExp<{ wrap: string; title?: string; code: string }>,
	render: ({ title, code }) => ({
		type: "pre",
		key: null,
		ref: null,
		$$typeof,
		props: {
			children: {
				type: "code",
				key: null,
				ref: null,
				$$typeof,
				props: { title: title?.trim() || undefined, children: code.trim() },
			},
		},
	}),
	contexts: ["block", "list"],
	priority: 10, // Higher priority than other blocks so e.g. lists inside fenced code don't become lists.
};

/**
 * Paragraph.
 * - When ordering rules, paragraph should go after other "block" context elements (because it has a very generous capture).
 */
export const PARAGRAPH_RULE: MarkupRule<{ paragraph: string }> = {
	match: getBlockRegExp(`(?<paragraph>${BLOCK_REGEXP.source})`) as NamedRegExp<{ paragraph: string }>,
	render: ({ paragraph }) => ({
		type: `p`,
		key: null,
		ref: null,
		$$typeof,
		props: { children: paragraph.trim() },
	}),
	contexts: ["block"],
	subcontext: "inline",
	priority: -10, // Lower precedence than other blocks so it matches last and paragraphs can be broken by other blocks.
};

/**
 * Autolinked URL starts with `http:` or `https:` or `mailto:` (any scheme in `options.schemes`) and matches an unlimited number of non-space characters.
 * - If followed by space and then text in `()` round or `[]` square brackets that will be used as the title, e.g. `http://google.com/maps (Google Maps)` or `http://google.com/maps [Google Maps]` (this syntax is from Todoist and maybe other things too).
 * - If no title is specified a cleaned up version of the URL will be used, e.g. `google.com/maps`
 * - If link is not valid (using `new URL(url)` then unparsed text will be returned.
 * - For security only schemes that appear in `options.schemes` will match (defaults to `http:` and `https:`).
 */
export const URL_CHAR = "[-$_@.&!*,=;/#?:%a-zA-Z0-9]";
export const URL_REGEXP = new RegExp(`(?<href>[a-z]+:${URL_CHAR}+)(?: +(?:\\((?<title>[^)]*?)\\)))?`) as NamedRegExp<{ title?: string; href: string }>;
export const URL_RULE: MarkupRule<{ title: string; href: string }> = {
	match: (input, options) => _urlMatch(URL_REGEXP.exec(input), options),
	render: ({ href, title }, { rel }) => ({
		type: "a",
		key: null,
		ref: null,
		$$typeof,
		props: { children: title, href, rel },
	}),
	contexts: ["inline", "list"],
	subcontext: "link",
};
function _urlMatch(match: NamedRegExpArray<{ title?: string; href: string }> | null, { schemes, url: base }: MarkupOptions): MarkupMatch<{ title: string; href: string }> | void {
	if (match) {
		const { 0: first, index, groups } = match;
		const { href, title } = groups;
		const url = getOptionalURL(href, base);
		if (url && schemes.includes(url.protocol)) {
			return { 0: first, index, groups: { href: url.href, title: title?.trim() || formatURL(url) } };
		}
	}
}

/**
 * Markdown-style link.
 * - Link in standard Markdown format, e.g. `[Google Maps](http://google.com/maps)`
 * - If no title is specified a cleaned up version of the URL will be used, e.g. `google.com/maps`
 * - Does not need space before/after the link.
 * - If link is not valid (using `new URL(url)` then unparsed text will be returned.
 * - For security only `http://` or `https://` links will work (if invalid the unparsed text will be returned).
 */
export const LINK_REGEXP = getRegExp(/\[(?<title>[^\]]*?)\]\((?<href>[^)]*?)\)/) as NamedRegExp<{ title: string; href: string }>;
export const LINK_RULE: MarkupRule<{ title: string; href: string }> = {
	...URL_RULE,
	match: (input, options) => _urlMatch(LINK_REGEXP.exec(input), options),
};

/**
 * Inline code.
 * - Text surrounded by one or more "`" backtick tilde characters.
 * - Unlike strong/emphasis first or last character of the element can be space, (e.g. `- abc -` will not work).
 * - Closing characters must exactly match opening characters.
 * - Same as Markdown syntax.
 */
export const CODE_RULE: MarkupRule<{ code: string }> = {
	match: new RegExp(`(?<wrap>\`+)(?<code>${BLOCK_REGEXP.source})\\k<wrap>`) as NamedRegExp<{ wrap: string; code: string }>, // Uses BLOCK instead of WORDS because whitespace is allowed (and kept) at start/end.
	render: ({ code }) => ({
		type: "code",
		key: null,
		ref: null,
		$$typeof,
		props: { children: code },
	}),
	contexts: ["inline", "list"],
	priority: 10, // Higher priority than e.g. `strong` or `em` (from CommonMark spec: "Code span backticks have higher precedence than any other inline constructs except HTML tags and autolinks.")
};

/**
 * Inline strong, emphasis, insert, delete, highlight.
 * - Inline strong text wrapped in one or more `*` asterisks.
 * - Inline emphasis text wrapped in one or more `_` underscores.
 * - Inline inserted text wrapped in one or more `+` pluses.
 * - Inline deleted text wrapped in one or more `-` minuses or `~` tildes.
 * - Inline highlighted text wrapped in one or more `=` equals or `:` colons.
 * - Whitespace cannot be the first or last character of the element (e.g. `* abc *` will not work).
 * - Closing chars must match opening characters.
 * - Cannot occur in the middle of a word (e.g. `this*that*this` will not work).
 * - Closing characters must exactly match opening characters.
 * - Different to Markdown: strong is always surrounded by `*asterisks*` and emphasis is always surrounded by `_underscores_` (strong isn't 'double emphasis').
 */
const INLINE_CHARS = { "-": "del", "~": "del", "+": "ins", "*": "strong", "_": "em", "=": "mark", ":": "mark" }; // Hyphen must be first so it works when we use the keys as a character class.
export const INLINE_RULE: MarkupRule<{ char: keyof typeof INLINE_CHARS; wrap: string; text: string }> = {
	match: new WordRegExp(`(?<wrap>(?<char>[${Object.keys(INLINE_CHARS).join("")}])+)(?<text>(?!\\k<char>)\\S|(?!\\k<char>)\\S[\\s\\S]*?(?!\\k<char>)\\S)\\k<wrap>`) as NamedRegExp<{ char: keyof typeof INLINE_CHARS; wrap: string; text: string }>, // prettier-ignore
	render: ({ char, text }) => ({
		type: INLINE_CHARS[char],
		key: null,
		ref: null,
		$$typeof,
		props: { children: text },
	}),
	contexts: ["inline", "list", "link"],
	subcontext: "inline",
};

/**
 * Hard linebreak (`<br />` tag).
 * - Any line break in a paragraph will become a hard `<br />` tag.
 * - Different to Markdown:
 *   - Markdown needs two spaces at the end of a line, any line break in a paragraph will be a `<br />` tag (lines without two spaces are not joined together).
 *   - This is more intuitive (a linebreak becomes a linebreak is isn't silently ignored).
 *   - This works better with textareas that wrap text (since manually breaking up long lines is no longer necessary).
 */
export const LINEBREAK_RULE: MarkupRule = {
	match: /\n/,
	render: () => ({
		type: "br",
		key: null,
		ref: null,
		$$typeof,
		props: {},
	}),
	contexts: ["inline", "list", "link"],
	subcontext: "inline",
};

/**
 * All markup rules.
 * - Syntax parsed by `renderMarkup()` is defined entirely by the list of rules (i.e. not by code).
 * - These default rules define a syntax similar to Markdown but:
 *   1. less weird and awkward
 *   2. more intuitive and expected
 *   3. more aligned with smaller textboxes and editors that have line wrapping
 * - HTML tags and character entities are never allowed (our use cases generally require a locked-down subset of syntax).
 */
export const MARKUP_RULES: MarkupRules = [
	HEADING_RULE,
	SEPARATOR_RULE,
	UNORDERED_RULE,
	ORDERED_RULE,
	BLOCKQUOTE_RULE,
	FENCED_CODE_RULE,
	PARAGRAPH_RULE,
	LINK_RULE,
	URL_RULE,
	CODE_RULE,
	INLINE_RULE,
	LINEBREAK_RULE,
	//
];

/** Subset of markup rules that work in a block context. */
export const MARKUP_RULES_BLOCK: MarkupRules = [
	HEADING_RULE,
	SEPARATOR_RULE,
	UNORDERED_RULE,
	ORDERED_RULE,
	BLOCKQUOTE_RULE,
	FENCED_CODE_RULE,
	PARAGRAPH_RULE,
	//
];

/** Subset of markup rules that work in an inline context. */
export const MARKUP_RULES_INLINE: MarkupRules = [
	LINK_RULE,
	URL_RULE,
	CODE_RULE,
	INLINE_RULE,
	LINEBREAK_RULE,
	//
];

/** Subset of markup rules that are relevant for collapsed shortform content. */
export const MARKUP_RULES_SHORTFORM: MarkupRules = [
	UNORDERED_RULE,
	ORDERED_RULE,
	PARAGRAPH_RULE,
	LINK_RULE,
	URL_RULE,
	CODE_RULE,
	INLINE_RULE,
	LINEBREAK_RULE,
	//
];
