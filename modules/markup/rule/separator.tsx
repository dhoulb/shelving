import { createLineRegExp } from "../util/regexp.js";
import { createMarkupRule } from "../util/rule.js";

const SEPARATOR_REGEXP = createLineRegExp("([-*•+_=])(?: *\\1){2,}");

/**
 * Separator (horizontal rule / thematic break).
 * - Same as Markdown syntax but also allows `•` bullet character (in addition to `-` dash, `+` plus, `*` asterisk, `_` underscore).
 * - Character must be repeated three (or more) times.
 * - Character must be the same every time (can't mix)
 * - Might have infinite number of spaces between the characters.
 */
export const SEPARATOR_RULE = createMarkupRule(SEPARATOR_REGEXP, (_match, _options, key) => <hr key={key} />, ["block"]);
