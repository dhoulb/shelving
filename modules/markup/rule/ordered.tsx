import type { ReactElement } from "react";
import { renderMarkup } from "../render.js";
import type { MarkupOptions } from "../util/options.js";
import { BLOCK_CONTENT_REGEXP, BLOCK_SPACE_REGEXP, createBlockRegExp, LINE_SPACE_REGEXP } from "../util/regexp.js";
import { createMarkupRule } from "../util/rule.js";

const INDENT = /^\t/gm; // Nesting is recognised with tabs only.
const NUMBER = "\\d{1,9}[.):]"; // Number for a numbered list, e.g. `1.` or `2)` or `3:` followed by one or more spaces.
const ITEM = new RegExp(
	`(?:^|\n)(${NUMBER})(?:${LINE_SPACE_REGEXP}+(${BLOCK_CONTENT_REGEXP}))?${BLOCK_SPACE_REGEXP}*(?=\n${NUMBER}(?:\\s|$)|$)`,
	"g",
);

export const ORDERED_REGEXP = createBlockRegExp<{
	list: string;
}>(`(?<list>${NUMBER}(?:${LINE_SPACE_REGEXP}+${BLOCK_CONTENT_REGEXP})?)`);

/**
 * Ordered list.
 * - Line starting with number, followed by `.`, `)` or `:` character, then one or more space characters.
 * - No spaces can appear before the number character.
 * - Second-level list can be created by indenting with `\t` one tab.
 * - Sparse lists are not supported.
 */
export const ORDERED_RULE = createMarkupRule(
	ORDERED_REGEXP,
	({ groups: { list } }, options, key) => <ol key={key}>{Array.from(_getOrderedItems(list, options))}</ol>,
	["block", "list"],
);

/** Parse a markdown list into a set of items elements. */
function* _getOrderedItems(list: string, options: MarkupOptions): Iterable<ReactElement> {
	let key = 0;
	for (const [_unused, number = "", item = ""] of list.matchAll(ITEM)) {
		yield (
			<li key={key++} value={Number.parseInt(number, 10)}>
				{renderMarkup(item.replace(INDENT, ""), options, "list")}
			</li>
		);
	}
}
