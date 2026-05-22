import { createMarkupRule } from "../MarkupRule.js";
import { BLOCK_CONTENT_REGEXP, createBlockRegExp } from "../util/regexp.js";

const PREFIX = ">";
const INDENT = new RegExp(`^${PREFIX}`, "gm");

/**
 * Blockquote block.
 * - `>` quote character followed by zero or more spaces.
 * - No spaces can appear before the `>` quote character.
 * - Quote block is only broken by `\n\n` two newline characters.
 */
export const BLOCKQUOTE_RULE = createMarkupRule<{
	quote: string;
}>(
	createBlockRegExp(`(?<quote>${PREFIX}${BLOCK_CONTENT_REGEXP})`),
	(key, { quote }, parser) => <blockquote key={key}>{parser.parse(quote.replace(INDENT, ""), "block")}</blockquote>,
	["block", "list"],
);
