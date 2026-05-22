import type { ReactElement } from "react";
import type { MarkupParser } from "../MarkupParser.js";
import { createMarkupRule } from "../MarkupRule.js";
import { BLOCK_CONTENT_REGEXP, BLOCK_SPACE_REGEXP, createBlockRegExp, LINE_SPACE_REGEXP } from "../util/regexp.js";

const _INDENT = /^\t/gm; // Nesting is recognised with tabs only.
const _NUMBER = "\\d{1,9}[.):]"; // Number for a numbered list, e.g. `1.` or `2)` or `3:` followed by one or more spaces.
const _ITEM = new RegExp(
	`(?:^|\n)(${_NUMBER})(?:${LINE_SPACE_REGEXP}+(${BLOCK_CONTENT_REGEXP}))?${BLOCK_SPACE_REGEXP}*(?=\n${_NUMBER}(?:\\s|$)|$)`,
	"g",
);

/**
 * Ordered list.
 * - Line starting with number, followed by `.`, `)` or `:` character, then one or more space characters.
 * - No spaces can appear before the number character.
 * - Second-level list can be created by indenting with `\t` one tab.
 * - Sparse lists are not supported.
 */
export const ORDERED_RULE = createMarkupRule<{
	list: string;
}>(
	createBlockRegExp(`(?<list>${_NUMBER}(?:${LINE_SPACE_REGEXP}+${BLOCK_CONTENT_REGEXP})?)`),
	(key, { list }, parser) => <ol key={key}>{Array.from(_getOrderedItems(list, parser))}</ol>,
	["block", "list"],
);

/** Parse a markdown list into a set of items elements. */
function* _getOrderedItems(list: string, parser: MarkupParser): Iterable<ReactElement> {
	let key = 0;
	for (const [_unused, number = "", item = ""] of list.matchAll(_ITEM)) {
		yield (
			<li key={key++} value={Number.parseInt(number, 10)}>
				{parser.parse(item.replace(_INDENT, ""), "list")}
			</li>
		);
	}
}
