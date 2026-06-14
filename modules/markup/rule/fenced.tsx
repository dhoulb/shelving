import { createMarkupRule } from "../MarkupRule.js";
import { BLOCK_CONTENT_REGEXP, BLOCK_START_REGEXP, createBlockRegExp, LINE_CONTENT_REGEXP, LINE_SPACE_REGEXP } from "../util/regexp.js";

const FENCE = "`{3,}|~{3,}";

/**
 * Fenced code blocks
 * - Same as Markdown syntax.
 * - Start when we reach an opening fence on a new line.
 * - Stop when we reach a matching closing fence on a new line, or the end of the string.
 * - Closing fence must be exactly the same as the opening fence, and can be made of three or more "```" backticks, or three or more `~~~` tildes.
 * - If there's no closing fence the code block will run to the end of the current string.
 * - Markdown-style four-space indent syntax is not supported (only fenced code since it's less confusing and more common).
 *
 * @example new MarkupParser({ rules: [FENCED_RULE] }).parse("```\ncode block\n```")
 * @see https://dhoulb.github.io/shelving/markup/rule/fenced/FENCED_RULE
 */
export const FENCED_RULE = createMarkupRule<{
	fence: string;
	title?: string;
	code: string;
}>(
	createBlockRegExp(
		`(?<code>${BLOCK_CONTENT_REGEXP})`,
		`${BLOCK_START_REGEXP}(?<fence>${FENCE}) *(?<title>${LINE_CONTENT_REGEXP})\n`, // Starts with the fence
		`(?:${LINE_SPACE_REGEXP}*\n\\k<fence>(?:\\s*\\n)?|$)`, // Ends when we hit the end of the string or the matching closing fence (trims any matching newlines after the fence).
	),
	(key, { title, code }) => {
		const caption = title?.trim();
		// Scrollable region pattern: focusable, labelled <figure> wraps the code block so keyboard users can arrow-scroll wide lines.
		return caption ? (
			<figure key={key}>
				<figcaption>{caption}</figcaption>
				<pre>
					<code>{code.trim()}</code>
				</pre>
			</figure>
		) : (
			<figure key={key}>
				<pre>
					<code>{code.trim()}</code>
				</pre>
			</figure>
		);
	},
	["block", "list"],
	10, // Higher priority than other `block` rules because it might contain content that matches other rules.
);
