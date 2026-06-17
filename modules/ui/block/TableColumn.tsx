import type { ReactElement } from "react";
import { getWidthClass, type WidthVariants } from "../style/Width.js";

/**
 * Props for `TableColumn` — the `width` (and `grow`) variants that size a table column.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/TableColumn/TableColumnProps
 */
export interface TableColumnProps extends WidthVariants {}

/**
 * Table column — rendered as `<col>`.
 * - Place inside a `<colgroup>` at the top of a `Table`, one `TableColumn` per column, to size the columns via the `width` variant.
 * - `width="fit"` shrinks a column to its content; an exact `width` (e.g. `width="12x"`) acts as a floor a column can grow past in the default auto table-layout — add `grow` to make that explicit.
 *
 * @kind component
 * @param props The `width` / `grow` variant props.
 * @returns Rendered `<col>` element.
 * @example <colgroup><TableColumn width="fit" /><TableColumn width="12x" grow /></colgroup>
 * @see https://dhoulb.github.io/shelving/ui/block/TableColumn/TableColumn
 */
export function TableColumn(props: TableColumnProps): ReactElement {
	return <col className={getWidthClass(props)} />;
}
