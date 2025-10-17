import { REACT_ELEMENT_TYPE } from "../util/internal.js";
import { getMarkupRule } from "../util/rule.js";

/**
 * Hard linebreak (`<br />` tag).
 * - Any `\n` linebreak in a paragraph will become a hard `<br />` tag.
 * - Leading and trailing whitespace before/after the linebreak is trimmed.
 * - Different to Markdown:
 *   - Markdown needs two spaces at the end of a line to create a linebreak.
 *   - We just directly convert any `\n` linebreak into a `<br />` tag (lines without two spaces are not joined together).
 *   - This is more intuitive (a linebreak becomes a linebreak is isn't silently ignored).
 *   - This works better with textareas that wrap text (since manually breaking up long lines is no longer necessary).
 */
export const LINEBREAK_RULE = getMarkupRule(
	/[^\n\S]*\n[^\n\S]*/,
	(_match, _options, key) => ({
		key,
		$$typeof: REACT_ELEMENT_TYPE,
		type: "br",
		props: {},
	}),
	["inline", "list", "link"],
);
