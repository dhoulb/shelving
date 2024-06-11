import { renderMarkup } from "../render.js";
import { REACT_ELEMENT_TYPE } from "../util/internal.js";
import { BLOCK_CONTENT_REGEXP, getBlockRegExp } from "../util/regexp.js";
import { getMarkupRule } from "../util/rule.js";

const PREFIX = ">";
const INDENT = new RegExp(`^${PREFIX}`, "gm");

export const BLOCKQUOTE_REGEXP = getBlockRegExp(`${PREFIX}${BLOCK_CONTENT_REGEXP}`);

/**
 * Blockquote block.
 * - `>` quote character followed by zero or more spaces.
 * - No spaces can appear before the `>` quote character.
 * - Quote block is only broken by `\n\n` two newline characters.
 */
export const BLOCKQUOTE_RULE = getMarkupRule(
	BLOCKQUOTE_REGEXP,
	([quote], options, key) => ({
		key,
		$$typeof: REACT_ELEMENT_TYPE,
		type: "blockquote",
		props: { children: renderMarkup(quote.replace(INDENT, ""), options, "block") },
	}),
	["block", "list"],
);
