import type { ReactElement } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import PARAGRAPH_CSS from "./Paragraph.module.css";

export const PARAGRAPH_CLASS = getModuleClass(PARAGRAPH_CSS, "paragraph");
export const PARAGRAPH_PROSE_CLASS = getModuleClass(PARAGRAPH_CSS, "prose");

export interface ParagraphProps extends ColorVariants, SpaceVariants, TypographyVariants, OptionalChildProps {}

export function Paragraph({ children, ...props }: ParagraphProps): ReactElement {
	return (
		<p
			className={getClass(
				PARAGRAPH_CLASS, //
				getColorClass(props),
				getSpaceClass(props),
				getTypographyClass(props),
			)}
		>
			{children}
		</p>
	);
}
