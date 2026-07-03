import { getSlug } from "../../util/string.js";
import { createMarkupRule } from "../MarkupRule.js";
import { createLineRegExp, LINE_CONTENT_REGEXP, LINE_SPACE_REGEXP } from "../util/regexp.js";

/**
 * Headings are single line only (don't allow multiline).
 * - `#` 1-6 hashes, then one or more spaces, then the title.
 * - `#` must be the first character on the line.
 * - Markdown's underline syntax is not supported (for simplification).
 * - Each heading gets a `getSlug()` `id` derived from its text, so same-page `#anchor` links resolve to it (e.g. `## React integration` becomes `id="react-integration"`). An all-punctuation heading that slugs to nothing gets no `id`.
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
		const title = heading.trim();
		// Slug the raw title (before inline parsing) for the `id`, so `#anchor` fragment links land on the heading.
		return (
			<Heading key={key} id={getSlug(title)}>
				{parser.parse(title, "inline")}
			</Heading>
		);
	},
	["block"],
);
