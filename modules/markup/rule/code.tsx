import { getRegExp } from "../../util/regexp.js";
import { BLOCK_CONTENT_REGEXP } from "../util/regexp.js";
import { createMarkupRule } from "../util/rule.js";

const CODE_REGEXP = getRegExp<{ code: string }>(`(?<fence>\`+)(?<code>${BLOCK_CONTENT_REGEXP})\\k<fence>`);

/**
 * Inline code.
 * - Text surrounded by one or more "`" backtick tilde characters.
 * - Unlike strong/emphasis first or last character of the element can be space, (e.g. `- abc -` will not work).
 * - Closing characters must exactly match opening characters.
 * - Same as Markdown syntax.
 */
export const CODE_RULE = createMarkupRule(
	CODE_REGEXP,
	({ groups: { code } }, _options, key) => <code key={key}>{code}</code>,
	["inline", "list"],
	10,
);
