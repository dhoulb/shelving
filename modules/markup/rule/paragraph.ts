import { renderMarkup } from "../render.js";
import { REACT_ELEMENT_TYPE } from "../util/internal.js";
import { BLOCK_SPACE_REGEXP, BLOCK_START_REGEXP, createBlockRegExp } from "../util/regexp.js";
import { createMarkupRule } from "../util/rule.js";

export const PARAGRAPH_REGEXP = createBlockRegExp<{
	paragraph: string;
}>(
	"(?<paragraph>(?:(?=\\S)[\\s\\S]*?\\S))",
	// Modify start regexp to trim whitespace at the start of the line.
	`${BLOCK_START_REGEXP}${BLOCK_SPACE_REGEXP}*`,
);

/**
 * Paragraph.
 * - Captures almost anything in a block context.
 * - Any run of non-whitespace.
 * - Leading and trailing whitespace is trimmed.
 */
export const PARAGRAPH_RULE = createMarkupRule(
	PARAGRAPH_REGEXP,
	({ groups: { paragraph } }, options, key) => ({
		key,
		$$typeof: REACT_ELEMENT_TYPE,
		type: "p",
		props: { children: renderMarkup(paragraph, options, "inline") },
	}),
	["block"],
	-10, // Low priority so it matches after other `block` elements (because it has a very generous capture).
);
