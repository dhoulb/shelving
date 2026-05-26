import type { ReactElement } from "react";
import { type AlignVariants, getAlignClass } from "../style/Align.js";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpacingClass, type SpacingVariants } from "../style/Spacing.js";
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
		OptionalChildProps {}

export function Blockquote({ children, ...variants }: BlockquoteProps): ReactElement {
	return (
		<blockquote
			className={getClass(
				getModuleClass(styles, "blockquote"),
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
