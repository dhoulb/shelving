import type { ReactElement } from "react";
import { type AlignVariants, getAlignClass } from "../style/Align.js";
import { getSpacingClass, type SpacingVariants } from "../style/Spacing.js";
import { getThicknessClass, type ThicknessVariants } from "../style/Thickness.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ChildProps } from "../util/props.js";
import styles from "./Table.module.css";

export interface TableProps extends AlignVariants, SpacingVariants, ThicknessVariants, TypographyVariants, ChildProps {}

/**
 * Table block — rendered as `<table>`.
 * - Wrap in a `<Figure scrollable>` (or any `scrollable` block) if the table may exceed the container width on small screens.
 * - Thickness variants apply to the `<th>` / `<td>` borders (the `<table>` element itself has no border).
 */
export function Table({ children, ...variants }: TableProps): ReactElement {
	return (
		<table
			className={getClass(
				getModuleClass(styles, "table"),
				getAlignClass(variants),
				getSpacingClass(variants),
				getThicknessClass(variants),
				getTypographyClass(variants),
			)}
		>
			{children}
		</table>
	);
}
