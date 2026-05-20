import type { ReactElement } from "react";
import { renderMarkup } from "../render.js";
import type { MarkupOptions } from "../util/options.js";
import { BLOCK_CONTENT_REGEXP, BLOCK_SPACE_REGEXP, createBlockRegExp, LINE_SPACE_REGEXP } from "../util/regexp.js";
import { createMarkupRule } from "../util/rule.js";

const INDENT = /^\t/gm; // Nesting is recognised with tabs only.
const BULLET = "[-*•+]"; // Allowed bullet symbol.
const ITEM = new RegExp(
	`(?:^|\n)${BULLET}(?:${LINE_SPACE_REGEXP}+(${BLOCK_CONTENT_REGEXP}))?${BLOCK_SPACE_REGEXP}*(?=\n${BULLET}(?:\\s|$)|$)`,
	"g",
);

export const UNORDERED_REGEXP = createBlockRegExp<{
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
export const UNORDERED_RULE = createMarkupRule(
	UNORDERED_REGEXP,
	({ groups: { list = "" } }, options, key) => <ul key={key}>{Array.from(_getItems(list, options))}</ul>,
	["block", "list"],
);

/** Parse a markdown list into a set of items elements. */
export function* _getItems(list: string, options: MarkupOptions): Iterable<ReactElement> {
	let key = 0;
	for (const [_unused, item = ""] of list.matchAll(ITEM)) {
		yield <li key={key++}>{renderMarkup(item.replace(INDENT, ""), options, "list")}</li>;
	}
}
