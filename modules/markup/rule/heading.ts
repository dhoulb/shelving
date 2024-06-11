import { renderMarkup } from "../render.js";
import { REACT_ELEMENT_TYPE } from "../util/internal.js";
import { LINE_CONTENT_REGEXP, LINE_SPACE_REGEXP, getLineRegExp } from "../util/regexp.js";
import { getMarkupRule } from "../util/rule.js";

const HEADING_REGEXP = getLineRegExp<{
	prefix: string;
	heading?: string;
}>(`(?<prefix>#{1,6})(?:${LINE_SPACE_REGEXP}+(?<heading>${LINE_CONTENT_REGEXP}))?`);

/**
 * Headings are single line only (don't allow multiline).
 * - `#` 1-6 hashes, then one or more spaces, then the title.
 * - `#` must be the first character on the line.
 * - Markdown's underline syntax is not supported (for simplification).
 */
export const HEADING_RULE = getMarkupRule(
	HEADING_REGEXP,
	({ groups: { prefix, heading = "" } }, options, key) => ({
		key,
		$$typeof: REACT_ELEMENT_TYPE,
		type: `h${prefix.length}`,
		props: { children: renderMarkup(heading.trim(), options, "inline") },
	}),
	["block"],
);
