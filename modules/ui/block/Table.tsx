import type { ReactElement } from "react";
import { type AlignVariants, getAlignClass } from "../style/Align.js";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpacingClass, type SpacingVariants } from "../style/Spacing.js";
import { getStatusClass, type Status } from "../style/Status.js";
import { getThicknessClass, type ThicknessVariants } from "../style/Thickness.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ChildProps } from "../util/props.js";
import styles from "./Table.module.css";

export interface TableProps extends AlignVariants, ColorVariants, SpacingVariants, ThicknessVariants, TypographyVariants, ChildProps {
	/** Status colour for the table (e.g. `"error"`). Combine with a `text-X` variant to tint the text. */
	status?: Status | undefined;
}

/**
 * Table block — rendered as `<table>`.
 * - Wrap in a `<Figure scrollable>` (or any `scrollable` block) if the table may exceed the container width on small screens.
 * - Thickness variants apply to the `<th>` / `<td>` borders (the `<table>` element itself has no border).
 */
export function Table({ children, status, ...variants }: TableProps): ReactElement {
	return (
		<table
			className={getClass(
				getModuleClass(styles, "table"),
				status && getStatusClass(status),
				getColorClass(variants),
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
