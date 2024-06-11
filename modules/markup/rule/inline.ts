import { renderMarkup } from "../render.js";
import { REACT_ELEMENT_TYPE } from "../util/internal.js";
import { getWordRegExp } from "../util/regexp.js";
import { getMarkupRule } from "../util/rule.js";

/** Map characters, e.g. `*`, to their coresponding HTML tag, e.g. `strong` */
const INLINE_CHARS = { "-": "del", "~": "del", "+": "ins", "*": "strong", _: "em", "=": "mark", ":": "mark" }; // Hyphen must be first so it works when we use the keys as a character class.

const INLINE_REGEXP = getWordRegExp<{
	char: keyof typeof INLINE_CHARS;
	text: string;
}>(`(?<wrap>(?<char>[${Object.keys(INLINE_CHARS).join("")}])+)(?<text>(?!\\k<char>)\\S(?:[\\s\\S]*?(?!\\k<char>)\\S)?)\\k<wrap>`);

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
export const INLINE_RULE = getMarkupRule(
	INLINE_REGEXP,
	({ groups: { char, text } }, options, key) => ({
		key,
		$$typeof: REACT_ELEMENT_TYPE,
		type: INLINE_CHARS[char],
		props: { children: renderMarkup(text, options, "inline") },
	}),
	["inline", "list", "link"],
);
