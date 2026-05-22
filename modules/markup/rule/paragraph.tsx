import { createMarkupRule } from "../MarkupRule.js";
import { BLOCK_SPACE_REGEXP, BLOCK_START_REGEXP, createBlockRegExp } from "../util/regexp.js";
/**
 * Paragraph.
 * - Captures almost anything in a block context.
 * - Any run of non-whitespace.
 * - Leading and trailing whitespace is trimmed.
 */
export const PARAGRAPH_RULE = createMarkupRule<{
	paragraph: string;
}>(
	createBlockRegExp(
		"(?<paragraph>(?:(?=\\S)[\\s\\S]*?\\S))",
		`${BLOCK_START_REGEXP}${BLOCK_SPACE_REGEXP}*`, // Modify start regexp to trim whitespace at the start of the line.
	),
	(key, { paragraph }, parser) => <p key={key}>{parser.parse(paragraph, "inline")}</p>,
	["block"],
	-10, // Low priority so it matches after other `block` elements (because it has a very generous capture).
);
