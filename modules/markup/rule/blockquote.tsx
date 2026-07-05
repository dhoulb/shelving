import { createMarkupRule } from "../MarkupRule.js";
import { BLOCK_CONTENT_REGEXP, createBlockRegExp } from "../util/regexp.js";

const PREFIX = ">";
const INDENT = new RegExp(`^${PREFIX}`, "gm");

/** Maximum blockquote nesting depth. Each `>` level recurses once, so an unbounded `>>>>…` line would overflow the stack; beyond this the remaining source is left as plain text. */
const MAX_DEPTH = 10;

/**
 * Blockquote block.
 * - `>` quote character followed by zero or more spaces.
 * - No spaces can appear before the `>` quote character.
 * - Quote block is only broken by `\n\n` two newline characters.
 * - Nesting is capped at `MAX_DEPTH` (10) levels; deeper `>` prefixes are rendered as plain text rather than recursed, so pathological input can't overflow the stack.
 *
 * @example new MarkupParser({ rules: [BLOCKQUOTE_RULE] }).parse("> Quoted text")
 * @see https://shelving.cc/markup/BLOCKQUOTE_RULE
 */
export const BLOCKQUOTE_RULE = createMarkupRule<{
	quote: string;
}>(
	createBlockRegExp(`(?<quote>${PREFIX}${BLOCK_CONTENT_REGEXP})`),
	(key, { quote }, parser) => {
		const inner = quote.replace(INDENT, "");
		// This blockquote is level `depth + 1`; once it reaches the cap, render the (still `>`-prefixed) remainder as
		// plain text instead of recursing, so nesting stops at exactly MAX_DEPTH levels and can't overflow the stack.
		if (parser.depth + 1 >= MAX_DEPTH) return <blockquote key={key}>{inner}</blockquote>;
		return <blockquote key={key}>{parser.nested().parse(inner, "block")}</blockquote>;
	},
	["block", "list"],
);
