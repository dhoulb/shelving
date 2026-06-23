import { createMarkupRule } from "../MarkupRule.js";
import { createWordRegExp } from "../util/regexp.js";

/** Map characters, e.g. `*`, to their coresponding HTML tag, e.g. `strong` */
const INLINE_CHARS = { "~": "del", "+": "ins", "*": "strong", _: "em", "=": "mark" } as const;

/**
 * Inline strong, emphasis, insert, delete, highlight.
 * - Inline strong text wrapped in one or more `*` asterisks.
 * - Inline emphasis text wrapped in one or more `_` underscores.
 * - Inline inserted text wrapped in one or more `+` pluses.
 * - Inline deleted text wrapped in one or more `~` tildes.
 * - Inline highlighted text wrapped in one or more `=` equals or `:` colons.
 * - Whitespace cannot be the first or last character of the element (e.g. `* abc *` will not work).
 * - Closing chars must match opening characters.
 * - Cannot occur in the middle of a word (e.g. `this*that*this` will not work).
 * - Closing characters must exactly match opening characters.
 * - Different to Markdown: strong is always surrounded by `*asterisks*` and emphasis is always surrounded by `_underscores_` (strong isn't 'double emphasis').
 *
 * @example new MarkupParser({ rules: [INLINE_RULE] }).parse("This is *bold* and _italic_")
 * @see https://shelving.cc/markup/INLINE_RULE
 */
export const INLINE_RULE = createMarkupRule<{
	char: keyof typeof INLINE_CHARS;
	text: string;
}>(
	createWordRegExp(
		`(?<wrap>(?<char>[${Object.keys(INLINE_CHARS).join("")}])+)(?<text>(?!\\k<char>)\\S(?:[\\s\\S]*?(?!\\k<char>)\\S)?)\\k<wrap>`,
	),
	(key, { char, text }, parser) => {
		const Inline = INLINE_CHARS[char];
		return <Inline key={key}>{parser.parse(text, "inline")}</Inline>;
	},
	["inline", "list", "link"],
);
