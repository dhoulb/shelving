import type { ReactElement } from "react";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getWidthClass, type WidthVariants } from "../style/Width.js";
import { getClass } from "../util/css.js";
import type { ChildProps } from "../util/props.js";

/**
 * Props for `TableCell` — width and typography variants plus `children`.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/TableCell/TableCellProps
 */
export interface TableCellProps extends WidthVariants, TypographyVariants, ChildProps {}

/**
 * Table body cell — rendered as `<td>`.
 * - Sets its column's width via the `width` variant. Unlike a `<col>`, a cell honours `min-width`, so `width="12x" grow` gives the column a hard minimum that fills the remaining space and keeps the table from collapsing the column on a narrow viewport.
 * - A column's width is the widest of its cells, so use this to size a column that has no header to set the width on.
 *
 * @kind component
 * @returns Rendered `<td>` element.
 * @example <TableCell width="12x" grow>A longer description that wants a sensible minimum width.</TableCell>
 * @see https://dhoulb.github.io/shelving/ui/block/TableCell/TableCell
 */
export function TableCell({ children, ...props }: TableCellProps): ReactElement {
	return <td className={getClass(getWidthClass(props), getTypographyClass(props)) || undefined}>{children}</td>;
}
