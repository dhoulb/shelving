import type { ReactElement } from "react";
import { getIndentClass, type IndentVariants } from "../style/Indent.js";
import { getPaddingClass, type PaddingVariants } from "../style/Padding.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getWidthClass, type WidthVariants } from "../style/Width.js";
import { getClass } from "../util/css.js";
import type { ClassProps, OptionalChildProps } from "../util/index.js";

/**
 * Props for `Cell` — padding, indent, width, and typography variants plus `children`.
 *
 * @see https://shelving.cc/ui/CellProps
 */
export interface CellProps extends PaddingVariants, IndentVariants, WidthVariants, TypographyVariants, OptionalChildProps, ClassProps {
	header?: boolean | undefined;
}

/**
 * Table cell.
 * - Rendered as `<td>` (or a `<th>` using `<Cell header>`).
 * - Sets its column's width via the `width` variant. Unlike a `<col>`, a cell honours `min-width`, so `width="12x" grow` gives the column a hard minimum that fills the remaining space and keeps the table from collapsing the column on a narrow viewport.
 * - A column's width is the widest of its cells, so use this to size a column that has no header to set the width on.
 * - `padding` sets the cell's top and bottom padding, and `indent` its left and right. Both override the table's `padding` / `indent`, and `indent` also overrides the zero outer padding of the first and last cells.
 *
 * @kind component
 * @see https://shelving.cc/ui/Cell
 */
export function Cell({ header = false, children, className, ...props }: CellProps): ReactElement {
	const Component = header ? "th" : "td";
	return (
		<Component
			className={getClass(
				getPaddingClass(props), //
				getIndentClass(props),
				getWidthClass(props),
				getTypographyClass(props),
				className,
			)}
		>
			{children}
		</Component>
	);
}
