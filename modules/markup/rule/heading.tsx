import { createMarkupRule } from "../MarkupRule.js";
import { createLineRegExp, LINE_CONTENT_REGEXP, LINE_SPACE_REGEXP } from "../util/regexp.js";

/**
 * Headings are single line only (don't allow multiline).
 * - `#` 1-6 hashes, then one or more spaces, then the title.
 * - `#` must be the first character on the line.
 * - Markdown's underline syntax is not supported (for simplification).
 *
 * @example new MarkupParser({ rules: [HEADING_RULE] }).parse("# Title")
 * @see https://shelving.cc/markup/HEADING_RULE
 */
export const HEADING_RULE = createMarkupRule<{
	prefix: string;
	heading?: string;
}>(
	createLineRegExp(`(?<prefix>#{1,6})(?:${LINE_SPACE_REGEXP}+(?<heading>${LINE_CONTENT_REGEXP}))?`),
	(key, { prefix, heading = "" }, parser) => {
		// The hash count picks the heading level; cast the dynamic tag to the known `h1`–`h6` set.
		const Heading = `h${prefix.length}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
		return <Heading key={key}>{parser.parse(heading.trim(), "inline")}</Heading>;
	},
	["block"],
);
