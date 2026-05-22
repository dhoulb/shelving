import type { ReactElement } from "react";
import type { MarkupParser } from "../MarkupParser.js";
import { createMarkupRule } from "../MarkupRule.js";
import { BLOCK_CONTENT_REGEXP, BLOCK_SPACE_REGEXP, createBlockRegExp, LINE_SPACE_REGEXP } from "../util/regexp.js";

const _INDENT = /^\t/gm; // Nesting is recognised with tabs only.
const _BULLET = "[-*•+]"; // Allowed bullet symbol.
const _ITEM = new RegExp(
	`(?:^|\n)${_BULLET}(?:${LINE_SPACE_REGEXP}+(${BLOCK_CONTENT_REGEXP}))?${BLOCK_SPACE_REGEXP}*(?=\n${_BULLET}(?:\\s|$)|$)`,
	"g",
);

/**
 * Unordered list.
 * - Line starting with `-`, `*`, `•`, or `+` character followed by one or more space characters.
 * - No spaces can appear before the bullet character.
 * - Second-level list can be created by indenting with `\t` one tab.
 * - List block is ended by `\n\n` two newline characters.
 * - Sparse lists are not supported.
 */
export const UNORDERED_RULE = createMarkupRule<{
	list: string;
}>(
	createBlockRegExp(`(?<list>${_BULLET}(?:${LINE_SPACE_REGEXP}+${BLOCK_CONTENT_REGEXP})?)`),
	(key, { list }, parser) => <ul key={key}>{Array.from(_getItems(list, parser))}</ul>,
	["block", "list"],
);

/** Parse a markdown list into a set of items elements. */
export function* _getItems(list: string, parser: MarkupParser): Iterable<ReactElement> {
	let key = 0;
	for (const [_unused, item = ""] of list.matchAll(_ITEM)) yield <li key={key++}>{parser.parse(item.replace(_INDENT, ""), "list")}</li>;
}
