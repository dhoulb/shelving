import type { ReactElement } from "react";
import { getWidthClass, type WidthVariants } from "../style/Width.js";

/**
 * Props for `TableColumn` — the `width` variant that sizes a table column.
 * - The `grow` flag is intentionally omitted: browsers ignore `min-width` on a `<col>`, so a minimum must live on the cells instead.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/TableColumn/TableColumnProps
 */
export interface TableColumnProps extends Omit<WidthVariants, "grow"> {}

/**
 * Table column — rendered as `<col>`.
 * - Place inside a `<colgroup>` at the top of a `Table`, one `TableColumn` per column, to size the columns via the `width` variant.
 * - `width="fit"` shrinks a column to its content; an exact `width` (e.g. `width="12x"`) sets the column's preferred width.
 * - A `<col>` width is only a *preference* — browsers ignore `min-width` on columns and will shrink one below its width when the table is squeezed. For a hard minimum that survives a narrow viewport (and lets the table scroll), put `grow` on the column's cells instead, e.g. `<td className={getWidthClass({ width: "12x", grow: true })}>`.
 *
 * @kind component
 * @param props The `width` variant prop.
 * @returns Rendered `<col>` element.
 * @example <colgroup><TableColumn width="fit" /><TableColumn width="12x" /></colgroup>
 * @see https://dhoulb.github.io/shelving/ui/block/TableColumn/TableColumn
 */
export function TableColumn(props: TableColumnProps): ReactElement {
	return <col className={getWidthClass(props)} />;
}
