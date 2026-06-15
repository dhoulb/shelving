import type { ReactElement } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import PARAGRAPH_CSS from "./Paragraph.module.css";

const PARAGRAPH_CLASS = getModuleClass(PARAGRAPH_CSS, "paragraph");

/**
 * Props for `Paragraph` — colour, space, and typography variants.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Paragraph/ParagraphProps
 */
export interface ParagraphProps extends ColorVariants, SpaceVariants, TypographyVariants, OptionalChildProps {}

/**
 * Get the combined `className` string for a paragraph from its styling variants.
 *
 * Composes the base paragraph class with the colour, space, and typography variant helpers, so anything that wants paragraph styling can apply it.
 *
 * @param variants Colour, space, and typography variants.
 * @returns A space-separated `className` string combining the paragraph class and resolved variant classes.
 * @example getParagraphClass({ space: "large" }) // "paragraph …"
 * @see https://dhoulb.github.io/shelving/ui/block/Paragraph/getParagraphClass
 */
export function getParagraphClass(variants: ParagraphProps): string {
	return getClass(
		PARAGRAPH_CLASS, //
		getColorClass(variants),
		getSpaceClass(variants),
		getTypographyClass(variants),
	);
}

/**
 * Paragraph block of body text — rendered as `<p>`.
 *
 * @kind component
 * @param props Colour, space, and typography variants plus `children`.
 * @returns Rendered `<p>` paragraph element.
 * @example <Paragraph>Hello world.</Paragraph>
 * @see https://dhoulb.github.io/shelving/ui/block/Paragraph/Paragraph
 */
export function Paragraph({ children, ...props }: ParagraphProps): ReactElement {
	return <p className={getParagraphClass(props)}>{children}</p>;
}
