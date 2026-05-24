import type { ReactElement } from "react";
import { type AlignVariants, getAlignClass } from "../style/Align.js";
import { getSpacingClass, type SpacingVariants } from "../style/Spacing.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import PARAGRAPH_CSS from "./Paragraph.module.css";

export interface ParagraphProps extends AlignVariants, SpacingVariants, OptionalChildProps {}

export function Paragraph({ children, ...variants }: ParagraphProps): ReactElement {
	return (
		<p
			className={getClass(
				getModuleClass(PARAGRAPH_CSS, "paragraph"), //
				getAlignClass(variants),
				getSpacingClass(variants),
			)}
		>
			{children}
		</p>
	);
}

export { PARAGRAPH_CSS };
