import type { ReactElement } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/index.js";
import CAPTION_CSS from "./Caption.module.css";

/**
 * CSS class applied to the root `<figcaption>` element of every `Caption`.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Caption/CAPTION_CLASS
 */
export const CAPTION_CLASS = getModuleClass(CAPTION_CSS, "divider");

/**
 * CSS class that styles `<figcaption>` elements when they appear inside `Prose`.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Caption/CAPTION_PROSE_CLASS
 */
export const CAPTION_PROSE_CLASS = getModuleClass(CAPTION_CSS, "prose");

/**
 * Props for `Caption` — colour, space, and typography variants plus optional children.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Caption/CaptionProps
 */
export interface CaptionProps extends ColorVariants, SpaceVariants, TypographyVariants, OptionalChildProps {}

/**
 * `<figcaption>` block — caption text for a `<Figure>`.
 *
 * @example <Figure><Image src="/cat.jpg" /><Caption>A cat</Caption></Figure>
 * @see https://dhoulb.github.io/shelving/ui/block/Caption/Caption
 */
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
