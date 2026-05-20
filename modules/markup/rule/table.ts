import type { Element } from "../../util/element.js";
import { renderMarkup } from "../render.js";
import { REACT_ELEMENT_TYPE } from "../util/internal.js";
import type { MarkupOptions } from "../util/options.js";
import { createBlockRegExp, LINE_SPACE_REGEXP } from "../util/regexp.js";
import { createMarkupRule } from "../util/rule.js";

// Constants.
const _SPACE = `${LINE_SPACE_REGEXP}*`; // Run of line whitespace (never crosses a newline).
const _CELL = `${_SPACE}:?-+:?${_SPACE}`; // Delimiter-row cell: one or more dashes with optional `:` alignment markers.
const _DELIMITER_SOURCE = `${_SPACE}\\|?(?:${_CELL}\\|)+(?:${_CELL})?${_SPACE}`; // Delimiter row: pipe-separated dash cells.
const _DELIMITER = new RegExp(`^${_DELIMITER_SOURCE}$`, "u"); // Tests whether a single line is a delimiter row.
const _ROW = "[^\\n]*\\|[^\\n]*"; // Any line containing at least one pipe.
const _SPLIT = /(?<!\\)\|/; // Splits a row into cells on unescaped pipes.

/** Regular expression matching a table block: a header row, a delimiter row, then any number of pipe rows. */
export const TABLE_REGEXP = createBlockRegExp<{ table: string }>(`(?<table>${_ROW}\\n${_DELIMITER_SOURCE}(?:\\n${_ROW})*)`);

/**
 * Table.
 * - Markdown-style pipe table: a header row, a `|---|` delimiter row, then body rows.
 * - Cells are pipe-separated; outer pipes are optional and whitespace around cells is trimmed.
 * - Extra `|---|` delimiter rows split the table into sections: the first section becomes `<thead>`, the last becomes `<tfoot>` (only when there are three or more sections), and every section in between becomes its own `<tbody>`.
 * - Column count and per-column alignment (`:--` left, `--:` right, `:-:` centered) come from the first delimiter row; ragged rows are padded or truncated to that count.
 * - Cell content is rendered as inline markup; write `\|` for a literal pipe inside a cell.
 */
export const TABLE_RULE = createMarkupRule(TABLE_REGEXP, ({ groups: { table } }, options, key) => _renderTable(table, options, key), [
	"block",
]);

/** Render a matched table block into a `<table>` element. */
function _renderTable(table: string, options: MarkupOptions, key: string): Element {
	const lines = table.split("\n");

	// Column count and alignment come from the first delimiter row — always line 1, guaranteed by `TABLE_REGEXP`.
	const aligns = _splitRow(lines[1] ?? "").map(_getAlign);

	// Split lines into sections at delimiter rows. Line 0 is the header and is never treated as a delimiter.
	const sections: string[][] = [];
	let section: string[] = [lines[0] ?? ""];
	for (let i = 1; i < lines.length; i++) {
		const line = lines[i] ?? "";
		if (_DELIMITER.test(line)) {
			sections.push(section);
			section = [];
		} else {
			section.push(line);
		}
	}
	sections.push(section);

	// First section is `<thead>`; the last is `<tfoot>` when there are 3+ sections; sections in between are each a `<tbody>`.
	const last = sections.length - 1;
	const children = sections.map((rows, s): Element => {
		const type = s === 0 ? "thead" : s === last && last >= 2 ? "tfoot" : "tbody";
		return {
			$$typeof: REACT_ELEMENT_TYPE,
			type,
			key: `${type}-${s}`,
			props: { children: Array.from(_renderRows(rows, s === 0 ? "th" : "td", aligns, options)) },
		};
	});

	return { key, $$typeof: REACT_ELEMENT_TYPE, type: "table", props: { children } };
}

/** Render the rows of one section into `<tr>` elements of `<th>` or `<td>` cells. */
function* _renderRows(
	rows: string[],
	cell: "th" | "td",
	aligns: readonly (string | undefined)[],
	options: MarkupOptions,
): Iterable<Element> {
	let r = 0;
	for (const row of rows) {
		const values = _splitRow(row);
		const cells = aligns.map((align, c): Element => {
			const children = renderMarkup(values[c] ?? "", options, "inline");
			return {
				$$typeof: REACT_ELEMENT_TYPE,
				type: cell,
				key: c.toString(),
				props: align ? { align, children } : { children },
			};
		});
		yield { $$typeof: REACT_ELEMENT_TYPE, type: "tr", key: (r++).toString(), props: { children: cells } };
	}
}

/** Split a table row into trimmed cell strings, honouring `\|` escaped pipes. */
function _splitRow(row: string): string[] {
	let line = row.trim();
	if (line.startsWith("|")) line = line.slice(1);
	if (line.endsWith("|")) line = line.slice(0, -1);
	return line.split(_SPLIT).map(cell => cell.trim().replaceAll("\\|", "|"));
}

/** Get the alignment of a delimiter-row cell, or `undefined` for the default (left). */
function _getAlign(cell: string): "center" | "right" | undefined {
	const start = cell.startsWith(":");
	const end = cell.endsWith(":");
	if (start && end) return "center";
	if (end) return "right";
	return undefined;
}
