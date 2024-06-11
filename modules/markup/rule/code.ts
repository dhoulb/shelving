import { getRegExp } from "../../util/regexp.js";
import { REACT_ELEMENT_TYPE } from "../util/internal.js";
import { BLOCK_CONTENT_REGEXP } from "../util/regexp.js";
import { getMarkupRule } from "../util/rule.js";

const CODE_REGEXP = getRegExp<{ code: string }>(`(?<fence>\`+)(?<code>${BLOCK_CONTENT_REGEXP})\\k<fence>`);

/**
 * Inline code.
 * - Text surrounded by one or more "`" backtick tilde characters.
 * - Unlike strong/emphasis first or last character of the element can be space, (e.g. `- abc -` will not work).
 * - Closing characters must exactly match opening characters.
 * - Same as Markdown syntax.
 */
export const CODE_RULE = getMarkupRule(
	CODE_REGEXP,
	({ groups: { code } }, options, key) => ({
		key,
		$$typeof: REACT_ELEMENT_TYPE,
		type: "code",
		props: { children: code },
	}),
	["inline", "list"],
	10,
);
