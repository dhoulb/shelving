import type { ReactElement } from "react";
import type { MarkupParser } from "../MarkupParser.js";
import { createMarkupRule } from "../MarkupRule.js";
import { BLOCK_CONTENT_REGEXP, BLOCK_SPACE_REGEXP, BLOCK_START_REGEXP, createBlockRegExp, LINE_SPACE_REGEXP } from "../util/regexp.js";

const _INDENT = /^\t/gm; // Nesting is recognised with tabs only.
const _BULLET = "[-*•+]"; // Allowed bullet symbol.
const _ITEM = new RegExp(
	`(?:^|\n)${_BULLET}(?:${LINE_SPACE_REGEXP}+(${BLOCK_CONTENT_REGEXP}))?${BLOCK_SPACE_REGEXP}*(?=\n${_BULLET}(?:\\s|$)|$)`,
	"g",
);

// End of a list block: the end of the string, or a blank line that is *not* followed by another
// item or an indented continuation line. A blank line before a new item or a continuation
// paragraph keeps the list going (a "loose" list); anything else ends the list.
const _END = `${BLOCK_SPACE_REGEXP}*(?:$|\\n${LINE_SPACE_REGEXP}*\\n(?!${LINE_SPACE_REGEXP}|${_BULLET}))`;

// A list is "loose" when it contains a blank line. Loose items are parsed as blocks so their
// content is wrapped in `<p>` tags instead of rendered inline.
const _LOOSE = new RegExp(`\\n${LINE_SPACE_REGEXP}*\\n`);

/**
 * Unordered list.
 * - Line starting with `-`, `*`, `•`, or `+` character followed by one or more space characters.
 * - No spaces can appear before the bullet character.
 * - Second-level list can be created by indenting with `\t` one tab.
 * - List block runs until a blank line that is not followed by another item or an indented continuation line.
 * - A list with blank lines between its items (or before a continuation paragraph) is "loose": its items are wrapped in `<p>` tags.
 * - Sparse lists are not supported.
 */
export const UNORDERED_RULE = createMarkupRule<{
	list: string;
}>(
	createBlockRegExp(`(?<list>${_BULLET}(?:${LINE_SPACE_REGEXP}+${BLOCK_CONTENT_REGEXP})?)`, BLOCK_START_REGEXP, _END),
	(key, { list }, parser) => <ul key={key}>{Array.from(_getItems(list, parser))}</ul>,
	["block", "list"],
);

/** Parse a markdown list into a set of items elements. */
export function* _getItems(list: string, parser: MarkupParser): Iterable<ReactElement> {
	// Items of a loose list are parsed as blocks so `PARAGRAPH_RULE` wraps their content in `<p>`.
	const context = _LOOSE.test(list) ? "block" : "list";
	let key = 0;
	for (const [_unused, item = ""] of list.matchAll(_ITEM)) yield <li key={key++}>{parser.parse(item.replace(_INDENT, ""), context)}</li>;
}
