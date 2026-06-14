import type { ReactElement } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/index.js";
import CAPTION_CSS from "./Caption.module.css";

export const CAPTION_CLASS = getModuleClass(CAPTION_CSS, "divider");
export const CAPTION_PROSE_CLASS = getModuleClass(CAPTION_CSS, "prose");

export interface CaptionProps extends ColorVariants, SpaceVariants, TypographyVariants, OptionalChildProps {}

/** `<figcaption>` block — caption text for a `<Figure>`. */
export function Caption({ children, ...props }: CaptionProps): ReactElement {
	return (
		<figcaption
			className={getClass(
				CAPTION_CLASS, //
				getColorClass(props),
				getSpaceClass(props),
				getTypographyClass(props),
			)}
		>
			{children}
		</figcaption>
	);
}
