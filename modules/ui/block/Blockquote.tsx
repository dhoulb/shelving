import type { ReactElement } from "react";
import { type AlignVariants, getAlignClass } from "../style/Align.js";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpacingClass, type SpacingVariants } from "../style/Spacing.js";
import { getStatusClass, type Status } from "../style/Status.js";
import { getThicknessClass, type ThicknessVariants } from "../style/Thickness.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import styles from "./Blockquote.module.css";

export interface BlockquoteProps
	extends AlignVariants,
		ColorVariants,
		SpacingVariants,
		ThicknessVariants,
		TypographyVariants,
		OptionalChildProps {
	/** Status colour for the blockquote (e.g. `"error"`). Combine with a `text-X` variant to tint the text. */
	status?: Status | undefined;
}

export function Blockquote({ children, status, ...variants }: BlockquoteProps): ReactElement {
	return (
		<blockquote
			className={getClass(
				getModuleClass(styles, "blockquote"),
				status && getStatusClass(status),
				getColorClass(variants),
				getAlignClass(variants),
				getSpacingClass(variants),
				getThicknessClass(variants),
				getTypographyClass(variants),
			)}
		>
			{children}
		</blockquote>
	);
}
