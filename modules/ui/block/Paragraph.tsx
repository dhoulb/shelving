import type { ReactElement } from "react";
import { type AlignVariants, getAlignClass } from "../style/Align.js";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpacingClass, type SpacingVariants } from "../style/Spacing.js";
import { getStatusClass, type Status } from "../style/Status.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import PARAGRAPH_CSS from "./Paragraph.module.css";

export interface ParagraphProps extends AlignVariants, ColorVariants, SpacingVariants, TypographyVariants, OptionalChildProps {
	/** Status colour for the paragraph (e.g. `"error"`). Sets the variant scope; combine with a `text-X` typography variant to actually tint the text. */
	status?: Status | undefined;
}

export function Paragraph({ children, status, ...variants }: ParagraphProps): ReactElement {
	return (
		<p
			className={getClass(
				getModuleClass(PARAGRAPH_CSS, "paragraph"),
				status && getStatusClass(status),
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
