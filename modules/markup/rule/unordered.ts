import type { JSXElement } from "../../util/jsx.js";
import { renderMarkup } from "../render.js";
import { REACT_ELEMENT_TYPE } from "../util/internal.js";
import type { MarkupOptions } from "../util/options.js";
import { BLOCK_CONTENT_REGEXP, BLOCK_SPACE_REGEXP, getBlockRegExp, LINE_SPACE_REGEXP } from "../util/regexp.js";
import { getMarkupRule } from "../util/rule.js";

const INDENT = /^\t/gm; // Nesting is recognised with tabs only.
const BULLET = "[-*•+]"; // Allowed bullet symbol.
const ITEM = new RegExp(
	`(?:^|\n)${BULLET}(?:${LINE_SPACE_REGEXP}+(${BLOCK_CONTENT_REGEXP}))?${BLOCK_SPACE_REGEXP}*(?=\n${BULLET}(?:\\s|$)|$)`,
	"g",
);

export const UNORDERED_REGEXP = getBlockRegExp<{
	list?: string;
}>(`(?<list>${BULLET}(?:${LINE_SPACE_REGEXP}+${BLOCK_CONTENT_REGEXP})?)`);

/**
 * Unordered list.
 * - Line starting with `-`, `*`, `•`, or `+` character followed by one or more space characters.
 * - No spaces can appear before the bullet character.
 * - Second-level list can be created by indenting with `\t` one tab.
 * - List block is ended by `\n\n` two newline characters.
 * - Sparse lists are not supported.
 */
export const UNORDERED_RULE = getMarkupRule(
	UNORDERED_REGEXP,
	({ groups: { list = "" } }, options, key) => ({
		key,
		$$typeof: REACT_ELEMENT_TYPE,
		type: "ul",
		props: {
			children: Array.from(_getItems(list, options)),
		},
	}),
	["block", "list"],
);

/** Parse a markdown list into a set of items elements. */
export function* _getItems(list: string, options: MarkupOptions): Iterable<JSXElement> {
	let key = 0;
	for (const [_unused, item = ""] of list.matchAll(ITEM)) {
		yield {
			$$typeof: REACT_ELEMENT_TYPE,
			type: "li",
			props: {
				children: renderMarkup(item.replace(INDENT, ""), options, "list"),
			},
			key: key.toString(),
		};
		key++;
	}
}
