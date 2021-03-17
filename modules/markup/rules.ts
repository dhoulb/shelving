import { formatUrl } from "../url";
import { createPropIterator } from "../object";
import type { MarkupElement, MarkupRule, MarkupRuleMatcher } from "./types";

// Regular expression partials (`\` slashes must be escaped as `\\`).
const LINE = "[^\\n]*"; // Match line of content (anything that's not a newline).
const LINE_START = "^\\n*|\\n+"; // Starts at start of line (one or more linebreak or start of string).
const LINE_END = "\\n+|$"; // Ends at end of line (one or more linebreak or end of string).
const BLOCK = "[\\s\\S]*?"; // Match block of content (including newlines so don't be greedy).
const BLOCK_START = "^\\n*|\\n+"; // Starts at start of a block (one or more linebreak or start of string).
const BLOCK_END = "\\n*$|\\n\\n+"; // End of a block (two or more linebreaks or end of string).
const BULLETS = "-*•+"; // Anything that can be a bullet (used for unordered lists and horizontal rules).
const UNORDERED = `[${BULLETS}] +`; // Anything that can be a bullet (used for unordered lists and horizontal rules).
const ORDERED = "[0-9]+[.):] +"; // Number for a numbered list (e.g. `1.` or `2)` or `3:`)
const WORDS = `\\S(?:[\\s\\S]*?\\S)?`; // Run of text that starts and ends with non-space characters (possibly multi-line).
const SPACE_BEFORE = "\\s|^"; // Space (or end of string) must appear before something (DH: ideally this would use a lookbehind but Safari doesn't support them as of September 2020).
const SPACE_AFTER = "(?=\\s|$)"; // Space (or end of string) must appear after something (uses a lookahead so it doesn't take up space).

// Regular expressions.
const REPLACE_INDENT = /^ {1,2}/gm;

// Regular expression makers.
const createMatcher = (regexp: RegExp): MarkupRuleMatcher => c => c.match(regexp);
const createBlockMatcher = (middle = BLOCK, end = BLOCK_END, start = BLOCK_START) => createMatcher(new RegExp(`(?:${start})${middle}(?:${end})`));
const createLineMatcher = (middle = LINE, end = LINE_END, start = LINE_START) => createMatcher(new RegExp(`(?:${start})${middle}(?:${end})`));
const createWrappedMatcher = (chars: string, middle = WORDS): MarkupRuleMatcher => {
	const regexp = new RegExp(`(${SPACE_BEFORE})(${chars})(${middle})\\2${SPACE_AFTER}`);
	return content => {
		const matches = content.match(regexp);
		if (matches && typeof matches.index === "number") {
			const [all = "", spaces = "", , children = ""] = matches; // Skip chars
			// Create a clean match array that doesn't have `SPACE_BEFORE` and `chars`
			const clean: RegExpMatchArray = [
				all.substr(spaces.length), // Adjust for `SPACE_BEFORE`
				children,
			];
			clean.index = matches.index + spaces.length; // Adjust for `SPACE_BEFORE`
			return clean;
		}
	};
};

/**
 * Headings are single line only (don't allow multiline).
 * - 1-6 hashes then 1+ spaces, then the title.
 * - Same as Markdown syntax.
 * - Markdown's underline syntax is not supported (for simplification).
 */
const HEADING: MarkupRule = {
	match: createLineMatcher(`(#{1,6}) +(${LINE})`),
	render: ([, prefix = "", children = ""]) => ({ type: `h${prefix.length}`, key: null, props: { children } }),
	contexts: ["block"],
	childContext: "inline",
};

/**
 * Horizontal rules
 * - Same as Markdown syntax but also allows `•` bullet character (in addition to `-` dash, `+` plus, `*` asterisk, and `_` underscore).
 * - Character must be repeated three (or more) times.
 * - Character must be the same every time (can't mix)
 * - Might have infinite number of spaces between the characters.
 */
const HR: MarkupRule = {
	match: createLineMatcher(`([${BULLETS}])(?: *\\1){2,}`),
	render: () => ({ type: "hr", key: null, props: {} }),
	contexts: ["block"],
};

/**
 * Unordered list.
 * - Roughly the same syntax as Markdown (might be some differences with indenting).
 * - No leading spaces are allowed for the top-level list.
 * - Lists can be created with `•` bullet characters (in addition to `-` dash, `+` plus, and `*` asterisk).
 * - Second-level list can be indented with 1-2 spaces.
 */
const UL: MarkupRule = {
	match: createBlockMatcher(`${UNORDERED}(${BLOCK})`),
	render: ([, list = ""]) => {
		const children = list.split(SPLIT_UL_ITEMS).map(mapUnorderedItem);
		return { type: "ul", key: null, props: { children } };
	},
	contexts: ["block", "list"],
	childContext: "list",
};
const SPLIT_UL_ITEMS = new RegExp(`\\n+${UNORDERED}`, "g");
const mapUnorderedItem = (item: string, key: number): MarkupElement => {
	const children = item.replace(REPLACE_INDENT, "");
	return { type: "li", key, props: { children } };
};

/**
 * Ordered list.
 * - No leading spaces are allowed for the top-level list.
 * - Second-level list can be indented with 1-3 spaces.
 */
const OL: MarkupRule = {
	match: createBlockMatcher(`(${ORDERED}${BLOCK})`),
	render: ([, list = ""]) => {
		const children = list.split(SPLIT_OL_ITEMS).map(mapOrderedItem);
		return { type: "ol", key: null, props: { children } };
	},
	contexts: ["block", "list"],
	childContext: "list",
};
const SPLIT_OL_ITEMS = new RegExp(`\\n+(?=${ORDERED})`, "g");
const mapOrderedItem = (item: string, key: number): MarkupElement => {
	const firstSpace = item.indexOf(" ");
	const value = parseInt(item.substr(0, firstSpace), 10);
	const children = item
		.substr(firstSpace + 1)
		.trimStart()
		.replace(REPLACE_INDENT, "");
	return { type: "li", key, props: { value, children } };
};

/**
 * Blockquote block.
 * - Same as Markdown's syntax.
 * - Block continues until it finds a line that doesn't start with `>`
 * - Quote indent symbol can be followed by zero or more spaces.
 */
const BLOCKQUOTE: MarkupRule = {
	match: createLineMatcher(`(>${LINE}(?:\\n>${LINE})*)`),
	render: ([, quote = ""]) => ({
		type: "blockquote",
		key: null,
		props: { children: quote.replace(BLOCKQUOTE_LINES, "") },
	}),
	contexts: ["block", "list"],
	childContext: "block",
};
const BLOCKQUOTE_LINES = /^>/gm;

/**
 * Fenced code blocks
 * - Same as Markdown syntax.
 * - Closing fence must be exactly the same as the opening fence, and can be made of at least three "```" backticks or three `~~~` tildes.
 * - If there's no closing fence the code block will run to the end of the current string.
 * - Markdown-style four-space indent syntax is not supported (only fenced code, since it's easier to use).
 */
const FENCED: MarkupRule = {
	// Matcher has its own end that only stops when it reaches a matching closing fence or the end of the string.
	match: createBlockMatcher(`(\`{3,}|~{3,}) *(${LINE})\\n(${BLOCK})`, `\\n\\1\\n+|\\n\\1$|$`),
	render: ([, , file, children]) => ({
		type: "pre",
		key: null,
		props: {
			children: {
				type: "code",
				key: null,
				props: { "data-file": file || undefined, children },
			},
		},
	}),
	contexts: ["block", "list"],
};

/**
 * Paragraph.
 * - When ordering rules, paragraph should go after other "block" context elements (because it has a very generous capture).
 */
const PARAGRAPH: MarkupRule = {
	match: createBlockMatcher(` *(${BLOCK})`),
	render: ([, children]) => ({ type: `p`, key: null, props: { children } }),
	contexts: ["block"],
	childContext: "inline",
	priority: -10, // Lower precedence than other blocks so it matches last and paragraphs can be broken by other blocks.
};

/**
 * Markdown-style link.
 * - Link in standard Markdown format, e.g. `[http://google.com/maps](Google Maps)`
 * - If no title is specified a cleaned up version of the URL will be used, e.g. `google.com/maps`
 * - Does not need space before/after the link.
 * - If link is not valid (using `new URL(url)` then unparsed text will be returned.
 * - For security only `http://` or `https://` links will work (if invalid the unparsed text will be returned).
 */
const LINK: MarkupRule = {
	// Custom matcher to check the URL against the allowed schemes.
	match: (content, { schemes }) => {
		const matches = content.match(LINK_RULE);
		if (matches && typeof matches.index === "number") {
			try {
				const url = new URL(matches[2] as string, window.location.href);
				if (url.protocol && schemes.includes(url.protocol)) {
					matches[2] = url.href; // Use fixed URL from `new URL`
					return matches;
				}
			} catch {
				// `new URL()` threw — no match.
			}
		}
	},
	render: ([, title = "", href = ""], { rel }) => ({ type: "a", key: null, props: { children: title || formatUrl(href), href, rel } }),
	contexts: ["inline", "list"],
	childContext: "link",
};
const LINK_RULE = /\[ *([^\]]*?) *\]\( *([^)]*?) *\)/;

/**
 * Autolinked URL starts with `http:` or `https:` and matches an unlimited number of non-space characters.
 * - If followed by space and then text in `()` round or `[]` square brackets that will be used as the title, e.g. `http://google.com/maps (Google Maps)` or `http://google.com/maps [Google Maps]` (this syntax is from Todoist and maybe other things too).
 * - If no title is specified a cleaned up version of the URL will be used, e.g. `google.com/maps`
 * - If link is not valid (using `new URL(url)` then unparsed text will be returned.
 * - For security only schemes that appear in the `options.schemes` will match (defaults to `http:` and `https:`).
 */
const AUTOLINK: MarkupRule = {
	// Custom matcher to check the URL against the allowed schemes.
	match: (content, { schemes }) => {
		const matches = content.match(URL_RULE);
		if (matches && typeof matches.index === "number") {
			const [all = "", spaces = "", href = "", title1 = "", title2 = ""] = matches;
			try {
				const url = new URL(href, window.location.href);
				if (url.protocol && schemes.includes(url.protocol)) {
					// Create a clean match array that doesn't have `SPACE_BEFORE` and flips title and href into the order used by `linkRule.render`
					const clean: RegExpMatchArray = [
						all.substr(spaces.length), // Adjust for `SPACE_BEFORE`
						title1 || title2, // Use either title.
						url.href, // Use fixed URL from `new URL`
					];
					clean.index = matches.index + spaces.length; // Adjust for `SPACE_BEFORE`
					return clean;
				}
			} catch {
				// `new URL()` threw — no match.
			}
		}
	},
	// Use the same renderer as `linkRule`
	render: LINK.render,
	contexts: ["inline", "list"],
	childContext: "link",
};
const URL_ROUGH = "[a-zA-Z][a-zA-Z0-9-]*:\\S+"; // A rough entire URL (e.g. `http:abc` or `mailto:def`).
const URL_RULE = new RegExp(`(${SPACE_BEFORE})(${URL_ROUGH})(?: +(?:\\( *([^)]*?) *\\)|\\[ *([^\\]]*?) *\\]))?`);

/**
 * Inline code.
 * - Text surrounded by one or more "`" backtick tilde characters.
 * - Must be surrounded by space (e.g. ` \`abc\` `) — so formatting cannot be applied inside a word (e.g. `a\`b\`c`).
 * - Unlike strong/emphasis first or last character of the element can be space, (e.g. `- abc -` will not work).
 * - Closing characters must exactly match opening characters.
 * - Same as Markdown syntax.
 */
const CODE: MarkupRule = {
	match: createWrappedMatcher("`{1,}", BLOCK), // Uses BLOCK instead of WORDS because whitespace is allowed (and kept) at start/end.
	render: ([, children]) => ({ type: "code", key: null, props: { children } }),
	contexts: ["inline", "list"],
	priority: 10, // Higher priority than other inlines so it matches first before e.g. `strong` or `em` (from CommonMark spec: "Code span backticks have higher precedence than any other inline constructs except HTML tags and autolinks.")
};

/**
 * Inline strong.
 * - Inline text wrapped in one or more `*` asterisks.
 * - Must be surrounded by space (e.g. ` *abc* `) — so formatting cannot be applied inside a word (e.g. `a*b*c`).
 * - Whitespace cannot be the first or last character of the element (e.g. `* abc *` will not work).
 * - Closing characters must exactly match opening characters.
 * - Different to Markdown: strong is always surrounded by `*asterisks*` and emphasis is always surrounded by `_underscores_` (strong isn't 'double emphasis').
 */
const STRONG: MarkupRule = {
	match: createWrappedMatcher("\\*{1,}"),
	render: ([, children]) => ({ type: "strong", key: null, props: { children } }),
	contexts: ["inline", "list", "link"],
	childContext: "inline",
};

/**
 * Inline emphasis.
 * - Inline text wrapped in one or more `_` underscore symbols.
 * - Must be surrounded by space (e.g. ` _abc_ `) — so formatting cannot be applied inside a word (e.g. `a_b_c`).
 * - Whitespace cannot be the first or last character of the element (e.g. `_ abc _` will not work).
 * - Closing characters must exactly match opening characters.
 * - Different to Markdown: strong is always surrounded by `*asterisks*` and emphasis is always surrounded by `_underscores_` (strong isn't 'double emphasis').
 */
const EM: MarkupRule = {
	match: createWrappedMatcher("_{1,}"),
	render: ([, children]) => ({ type: "em", key: null, props: { children } }),
	contexts: ["inline", "list", "link"],
	childContext: "inline",
};

/**
 * Inserted text (`<ins>` tag),
 * - Inline text wrapped in one or more `+` pluses.
 * - Must be surrounded by space (e.g. ` +abc+ `) — so formatting cannot be applied inside a word (e.g. `a+b+c`).
 * - Whitespace cannot be the first or last character of the element (e.g. `+ abc +` will not work).
 * - Closing characters must exactly match opening characters.
 * - Markdown doesn't have this.
 */
const INS: MarkupRule = {
	match: createWrappedMatcher("\\+{1,}"),
	render: ([, children]) => ({ type: "ins", key: null, props: { children } }),
	contexts: ["inline", "list", "link"],
	childContext: "inline",
};

/**
 * Deleted text (`<del>` tag),
 * - Inline text wrapped in one or more `-` hyphens.
 * - Must be surrounded by space (e.g. ` -abc- `) — so formatting cannot be applied inside a word (e.g. `a-b-c`).
 * - Whitespace cannot be the first or last character of the element (e.g. `- abc -` will not work).
 * - Closing characters must exactly match opening characters.
 * - Markdown doesn't have this.
 */
const DEL: MarkupRule = {
	match: createWrappedMatcher("-{1,}"),
	render: ([, children]) => ({ type: "del", key: null, props: { children } }),
	contexts: ["inline", "list", "link"],
	childContext: "inline",
};

/**
 * Hard linebreak (`<br />` tag).
 * - Any line break in a paragraph will become a hard `<br />` tag.
 * - Different to Markdown:
 *   - Markdown needs two spaces at the end of a line, any line break in a paragraph will be a `<br />` tag (lines without two spaces are not joined together).
 *   - This is more intuitive (a linebreak becomes a linebreak is isn't silently ignored).
 *   - This works better with textareas that wrap text (since manually breaking up long lines is no longer necessary).
 */
const BR: MarkupRule = {
	match: createMatcher(/\n/),
	render: () => ({ type: "br", key: null, props: {} }),
	contexts: ["inline", "list", "link"],
	childContext: "inline",
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
export const MARKUP_RULES = createPropIterator({ HEADING, HR, UL, OL, BLOCKQUOTE, FENCED, PARAGRAPH, LINK, AUTOLINK, CODE, STRONG, EM, INS, DEL, BR });

/** Default markup rules for user-generated-content rendering. */
export const MARKUP_RULES_UGC = createPropIterator({ UL, OL, PARAGRAPH, LINK, AUTOLINK, CODE, STRONG, EM, INS, DEL, BR });
