import type { ReactElement } from "react";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getWidthClass, type WidthVariants } from "../style/Width.js";
import { getClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/index.js";

/**
 * Props for `Cell` — width and typography variants plus `children`.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Cell/CellProps
 */
export interface CellProps extends WidthVariants, TypographyVariants, OptionalChildProps {
	header?: boolean | undefined;
}

/**
 * Table cell.
 * - Rendered as `<td>` (or a `<th>` using `<Cell header>`).
 * - Sets its column's width via the `width` variant. Unlike a `<col>`, a cell honours `min-width`, so `width="12x" grow` gives the column a hard minimum that fills the remaining space and keeps the table from collapsing the column on a narrow viewport.
 * - A column's width is the widest of its cells, so use this to size a column that has no header to set the width on.
 *
 * @kind component
 * @returns Rendered `<td>` element.
 * @example <Cell width="12x" grow>A longer description that wants a sensible minimum width.</Cell>
 * @see https://dhoulb.github.io/shelving/ui/block/Cell/Cell
 */
export function Cell({ header = false, children, ...props }: CellProps): ReactElement {
	const Component = header ? "th" : "td";
	return (
		<Component
			className={getClass(
				getWidthClass(props), //
				getTypographyClass(props),
			)}
		>
			{children}
		</Component>
	);
}
