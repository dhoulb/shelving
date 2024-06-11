import type { JSXElement } from "../../util/jsx.js";
import { renderMarkup } from "../render.js";
import { REACT_ELEMENT_TYPE } from "../util/internal.js";
import type { MarkupOptions } from "../util/options.js";
import { BLOCK_CONTENT_REGEXP, BLOCK_SPACE_REGEXP, LINE_SPACE_REGEXP, getBlockRegExp } from "../util/regexp.js";
import { getMarkupRule } from "../util/rule.js";

const INDENT = /^\t/gm; // Nesting is recognised with tabs only.
const NUMBER = "\\d{1,9}[.):]"; // Number for a numbered list, e.g. `1.` or `2)` or `3:` followed by one or more spaces.
const ITEM = new RegExp(
	`(?:^|\n)(${NUMBER})(?:${LINE_SPACE_REGEXP}+(${BLOCK_CONTENT_REGEXP}))?${BLOCK_SPACE_REGEXP}*(?=\n${NUMBER}(?:\\s|$)|$)`,
	"g",
);

export const ORDERED_REGEXP = getBlockRegExp<{
	list: string;
}>(`(?<list>${NUMBER}(?:${LINE_SPACE_REGEXP}+${BLOCK_CONTENT_REGEXP})?)`);

/**
 * Ordered list.
 * - Line starting with number, followed by `.`, `)` or `:` character, then one or more space characters.
 * - No spaces can appear before the number character.
 * - Second-level list can be created by indenting with `\t` one tab.
 * - Sparse lists are not supported.
 */
export const ORDERED_RULE = getMarkupRule(
	ORDERED_REGEXP,
	({ groups: { list } }, options, key) => ({
		key,
		$$typeof: REACT_ELEMENT_TYPE,
		type: "ol",
		props: {
			children: Array.from(_getOrderedItems(list, options)),
		},
	}),
	["block", "list"],
);

/** Parse a markdown list into a set of items elements. */
function* _getOrderedItems(list: string, options: MarkupOptions): Iterable<JSXElement> {
	let key = 0;
	for (const [unused, number = "", item = ""] of list.matchAll(ITEM)) {
		yield {
			$$typeof: REACT_ELEMENT_TYPE,
			type: "li",
			props: {
				value: Number.parseInt(number, 10),
				children: renderMarkup(item.replace(INDENT, ""), options, "list"),
			},
			key: key.toString(),
		};
		key++;
	}
}
