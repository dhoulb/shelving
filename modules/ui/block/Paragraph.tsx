import type { ReactElement } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import PARAGRAPH_CSS from "./Paragraph.module.css";

/**
 * CSS class applied to the root element of every `Paragraph`.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Paragraph/PARAGRAPH_CLASS
 */
export const PARAGRAPH_CLASS = getModuleClass(PARAGRAPH_CSS, "paragraph");

/**
 * CSS class that styles a `Paragraph` when it appears inside `Prose` longform content.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Paragraph/PARAGRAPH_PROSE_CLASS
 */
export const PARAGRAPH_PROSE_CLASS = getModuleClass(PARAGRAPH_CSS, "prose");

/**
 * Props for `Paragraph` — colour, space, and typography variants.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Paragraph/ParagraphProps
 */
export interface ParagraphProps extends ColorVariants, SpaceVariants, TypographyVariants, OptionalChildProps {}

/**
 * Paragraph block of body text — rendered as `<p>`.
 *
 * @param props Colour, space, and typography variants plus `children`.
 * @returns Rendered `<p>` paragraph element.
 * @example <Paragraph>Hello world.</Paragraph>
 * @see https://dhoulb.github.io/shelving/ui/block/Paragraph/Paragraph
 */
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
