import type { ReactElement } from "react";
import { type ColorProps, getColorClass } from "../style/Color.js";
import { getSpacingClass, type SpacingVariants } from "../style/Spacing.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/index.js";
import CAPTION_CSS from "./Caption.module.css";

export const CAPTION_CLASS = getModuleClass(CAPTION_CSS, "divider");
export const CAPTION_PROSE_CLASS = getModuleClass(CAPTION_CSS, "prose");

export interface CaptionProps extends ColorProps, SpacingVariants, TypographyVariants, OptionalChildProps {}

/** `<figcaption>` block — caption text for a `<Figure>`. */
export function Caption({ children, ...props }: CaptionProps): ReactElement {
	return (
		<figcaption
			className={getClass(
				CAPTION_CLASS, //
				getColorClass(props),
				getSpacingClass(props),
				getTypographyClass(props),
			)}
		>
			{children}
		</figcaption>
	);
}
