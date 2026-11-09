import type { ImmutableArray } from "../../util/array.js";
import type { NamedRegExp } from "../../util/regexp.js";
import { createMarkupRule } from "../MarkupRule.js";
import { BLOCK_CONTENT_REGEXP, BLOCK_START_REGEXP, createBlockRegExp, LINE_CONTENT_REGEXP, LINE_SPACE_REGEXP } from "../util/regexp.js";

const FENCE = "`{3,}|~{3,}";

/**
 * Parts of the info string that follows the opening fence of a fenced code block.
 *
 * @see https://shelving.cc/markup/FencedInfo
 */
export interface FencedInfo {
	/** Language of the code, e.g. `"tsx"`, or `""` if the info string has no language. */
	readonly language: string;
	/** Flags that follow the language, e.g. `["live"]`. */
	readonly flags: ImmutableArray<string>;
	/** Title to show above the code, or `""` if the info string has no title. */
	readonly title: string;
}

/**
 * Parse the info string of a fenced code block into its language, flags, and title.
 * - The first word is the language, e.g. `tsx`.
 * - A first word with a dot is a file name, e.g. `worker.ts`: it becomes the title, and its extension becomes the language.
 * - Each other word is a flag, e.g. `live`.
 * - Text in double quotes is the title, e.g. `"Card with a link"`.
 *
 * @param info The text after the opening fence, e.g. `tsx live "Card with a link"`.
 * @returns The parsed language, flags, and title.
 * @example parseFencedInfo('tsx live "My card"') // { language: "tsx", flags: ["live"], title: "My card" }
 * @see https://shelving.cc/markup/parseFencedInfo
 */
export function parseFencedInfo(info: string): FencedInfo {
	let language = "";
	let title = "";
	const flags: string[] = [];
	for (const [, quoted, word] of info.matchAll(/"([^"]*)"|(\S+)/g)) {
		if (quoted !== undefined) title = quoted.trim();
		else if (!word) continue;
		else if (language || flags.length) flags.push(word);
		else if (word.includes(".")) {
			title ||= word;
			language = word.slice(word.lastIndexOf(".") + 1);
		} else language = word;
	}
	return { language, flags, title };
}

/**
 * Create the regular expression that matches a fenced code block.
 *
 * @param info Regular expression source that the info string after the opening fence must match.
 * @returns A block regular expression with `fence`, `info`, and `code` named groups.
 * @example createFencedRegExp("tsx live") // Matches only fences that start with ```tsx live
 * @see https://shelving.cc/markup/createFencedRegExp
 */
export function createFencedRegExp(info: string = LINE_CONTENT_REGEXP): NamedRegExp<{ fence: string; info?: string; code: string }> {
	return createBlockRegExp<{ fence: string; info?: string; code: string }>(
		`(?<code>${BLOCK_CONTENT_REGEXP})`,
		`${BLOCK_START_REGEXP}(?<fence>${FENCE}) *(?<info>${info})\n`, // Starts with the fence
		`(?:${LINE_SPACE_REGEXP}*\n\\k<fence>(?:\\s*\\n)?|$)`, // Ends when we hit the end of the string or the matching closing fence (trims any matching newlines after the fence).
	);
}

/**
 * Fenced code blocks
 * - Same as Markdown syntax.
 * - Start when we reach an opening fence on a new line.
 * - Stop when we reach a matching closing fence on a new line, or the end of the string.
 * - Closing fence must be exactly the same as the opening fence, and can be made of three or more backticks, or three or more `~~~` tildes.
 * - If there's no closing fence the code block will run to the end of the current string.
 * - The info string after the opening fence is parsed with `parseFencedInfo()`: only its title shows, as a caption.
 * - Markdown-style four-space indent syntax is not supported (only fenced code since it's less confusing and more common).
 *
 * @example new MarkupParser({ rules: [FENCED_RULE] }).parse("```\ncode block\n```")
 * @see https://shelving.cc/markup/FENCED_RULE
 */
export const FENCED_RULE = createMarkupRule(
	createFencedRegExp(),
	(key, { info = "", code }) => {
		const { title } = parseFencedInfo(info);
		// Scrollable region pattern: focusable, labelled <figure> wraps the code block so keyboard users can arrow-scroll wide lines.
		return title ? (
			<figure key={key}>
				<figcaption>{title}</figcaption>
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
