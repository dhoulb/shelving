import { createMarkupRule } from "../MarkupRule.js";
import { createLineRegExp } from "../util/regexp.js";

/**
 * Separator (horizontal rule / thematic break).
 * - Same as Markdown syntax but also allows `•` bullet character (in addition to `-` dash, `+` plus, `*` asterisk, `_` underscore).
 * - Character must be repeated three (or more) times.
 * - Character must be the same every time (can't mix)
 * - Might have infinite number of spaces between the characters.
 */
export const SEPARATOR_RULE = createMarkupRule(
	createLineRegExp("([-*•+_=])(?: *\\1){2,}"), //
	key => <hr key={key} />,
	["block"],
);
