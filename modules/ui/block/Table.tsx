import type { ReactElement } from "react";
import { type AlignVariants, getAlignClass } from "../style/Align.js";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpacingClass, type SpacingVariants } from "../style/Spacing.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ChildProps } from "../util/props.js";
import TABLE_CSS from "./Table.module.css";

export const TABLE_CLASS = getModuleClass(TABLE_CSS, "divider");
export const TABLE_PROSE_CLASS = getModuleClass(TABLE_CSS, "prose");

export interface TableProps extends AlignVariants, ColorVariants, SpacingVariants, TypographyVariants, ChildProps {}

/**
 * Table block — rendered as `<table>`.
 * - Wrap in a `<Figure scrollable>` (or any `scrollable` block) if the table may exceed the container width on small screens.
 * - `<th>` / `<td>` cells draw the borders (the `<table>` element itself has none); override their weight via the `--table-border` / `--table-stroke` hooks.
 */
export function Table({ children, ...variants }: TableProps): ReactElement {
	return (
		<table
			className={getClass(
				TABLE_CLASS,
				getColorClass(variants),
				getAlignClass(variants),
				getSpacingClass(variants),
				getTypographyClass(variants),
			)}
		>
			{children}
		</table>
	);
}
