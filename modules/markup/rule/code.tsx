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
 * - Renders in the `"link"` context too, so a code span inside link text (e.g. `` [`Collection`](/x) ``) works.
 * - Default `priority` (`0`): no other inline rule starts with a backtick, so a code span never needs to win a
 *   tie-break — and an elevated priority would wrongly let it split an earlier-starting container (link, strong/em).
 */
export const CODE_RULE = createMarkupRule(CODE_REGEXP, ({ groups: { code } }, _options, key) => <code key={key}>{code}</code>, [
	"inline",
	"list",
	"link",
]);
