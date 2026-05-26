import type { ReactElement } from "react";
import { type AlignVariants, getAlignClass } from "../style/Align.js";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpacingClass, type SpacingVariants } from "../style/Spacing.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import PARAGRAPH_CSS from "./Paragraph.module.css";

export interface ParagraphProps extends AlignVariants, ColorVariants, SpacingVariants, TypographyVariants, OptionalChildProps {}

export function Paragraph({ children, ...variants }: ParagraphProps): ReactElement {
	return (
		<p
			className={getClass(
				getModuleClass(PARAGRAPH_CSS, "paragraph"),
				getColorClass(variants),
				getAlignClass(variants),
				getSpacingClass(variants),
				getTypographyClass(variants),
			)}
		>
			{children}
		</p>
	);
}

export { PARAGRAPH_CSS };
