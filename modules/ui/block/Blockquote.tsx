import type { ReactElement } from "react";
import { type AlignVariants, getAlignClass } from "../style/Align.js";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpacingClass, type SpacingVariants } from "../style/Spacing.js";
import { getThicknessClass, type ThicknessVariants } from "../style/Thickness.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import BLOCKQUOTE_CSS from "./Blockquote.module.css";

export const BLOCKQUOTE_CLASS = getModuleClass(BLOCKQUOTE_CSS, "blockquote");
export const BLOCKQUOTE_PROSE_CLASS = getModuleClass(BLOCKQUOTE_CSS, "prose");

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
				BLOCKQUOTE_CLASS,
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
