import { getRegExp } from "../../util/regexp.js";
import { createMarkupRule } from "../MarkupRule.js";
import { BLOCK_CONTENT_REGEXP } from "../util/regexp.js";

/**
 * Inline code.
 * - Text surrounded by one or more "`" backtick tilde characters.
 * - Unlike strong/emphasis first or last character of the element can be space, (e.g. `- abc -` will not work).
 * - Closing characters must exactly match opening characters.
 * - Works inside link text too, e.g. `` [`code`](url) ``.
 * - Same as Markdown syntax.
 */
// Priority 10: code is a higher-precedence tier, resolved and masked before links/emphasis, so a
// code span that straddles a link delimiter wins and the link cannot form across it.
export const CODE_RULE = createMarkupRule<{
	code: string;
}>(
	getRegExp(`(?<fence>\`+)(?<code>${BLOCK_CONTENT_REGEXP})\\k<fence>`),
	(key, { code }) => <code key={key}>{code}</code>,
	["inline", "list", "link"],
	10,
);
