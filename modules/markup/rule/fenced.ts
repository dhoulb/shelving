import { REACT_ELEMENT_TYPE } from "../util/internal.js";
import { BLOCK_CONTENT_REGEXP, BLOCK_START_REGEXP, LINE_CONTENT_REGEXP, LINE_SPACE_REGEXP, getBlockRegExp } from "../util/regexp.js";
import { getMarkupRule } from "../util/rule.js";

const FENCE = "`{3,}|~{3,}";

const FENCED_REGEXP = getBlockRegExp<{
	fence: string;
	title?: string;
	code: string;
}>(
	`(?<code>${BLOCK_CONTENT_REGEXP})`,
	// Starts with the fence
	`${BLOCK_START_REGEXP}(?<fence>${FENCE}) *(?<title>${LINE_CONTENT_REGEXP})\n`,
	// Ends when we hit the end of the string or the matching closing fence (trims any matching newlines after the fence).
	`(?:${LINE_SPACE_REGEXP}*\n\\k<fence>(?:\\s*\\n)?|$)`,
);

/**
 * Fenced code blocks
 * - Same as Markdown syntax.
 * - Start when we reach an opening fence on a new line.
 * - Stop when we reach a matching closing fence on a new line, or the end of the string.
 * - Closing fence must be exactly the same as the opening fence, and can be made of three or more "```" backticks, or three or more `~~~` tildes.
 * - If there's no closing fence the code block will run to the end of the current string.
 * - Markdown-style four-space indent syntax is not supported (only fenced code since it's less confusing and more common).
 */
export const FENCED_RULE = getMarkupRule(
	FENCED_REGEXP,
	({ groups: { title, code } }, options, key) => ({
		key,
		$$typeof: REACT_ELEMENT_TYPE,
		type: "pre",
		props: {
			children: {
				$$typeof: REACT_ELEMENT_TYPE,
				type: "code",
				key: null,
				props: {
					title: title?.trim() || undefined,
					children: code.trim(),
				},
			},
		},
	}),
	["block", "list"],
	10, // Higher priority than other `block` rules because it might contain content that matches other rules.
);
