import { getModuleClass } from "../util/css.js";
import TYPOGRAPHY_CSS from "./Typography.module.css";

/**
 * Enumerated font-size scale selectable via the `size` variant prop.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Typography/UISize
 */
export type UISize = "xxsmall" | "xsmall" | "small" | "normal" | "large" | "xlarge" | "xxlarge";

/**
 * Enumerated font-family names selectable via the `font` variant prop.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Typography/UIFont
 */
export type UIFont = "title" | "body" | "label" | "code" | "serif" | "sans" | "monospace";

/**
 * Enumerated font-weight names selectable via the `weight` variant prop.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Typography/UIWeight
 */
export type UIWeight = "title" | "body" | "label" | "code" | "normal" | "strong";

/**
 * Enumerated tint shades selectable via the `tint` variant prop — shades of the current tint colour from `"00"` (black) through `"50"` (the hue itself) to `"100"` (white).
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Typography/UITint
 */
export type UITint =
	| "00"
	| "05"
	| "10"
	| "15"
	| "20"
	| "25"
	| "30"
	| "35"
	| "40"
	| "45"
	| "50"
	| "55"
	| "60"
	| "65"
	| "70"
	| "75"
	| "80"
	| "85"
	| "90"
	| "95"
	| "100";

/**
 * Text-alignment variant props — opt-in modifiers any prose component can mix in via `getTypographyClass()`.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Typography/AlignVariants
 */
export type AlignVariants = {
	/** Align text to the start of the line (LTR: left). */
	left?: boolean | undefined;
	/** Centre text horizontally. */
	center?: boolean | undefined;
	/** Align text to the end of the line (LTR: right). */
	right?: boolean | undefined;
};

/**
 * Typographic variant props — font-family, weight, alignment, size, and tint.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Typography/TypographyVariants
 */
export interface TypographyVariants extends AlignVariants {
	/** Font family. */
	font?: UIFont | undefined;
	/** Font weight */
	weight?: UIWeight | undefined;
	/** Font size of the element. */
	size?: UISize | undefined;
	/** Set CSS text `color:` to one of the shades of the current tint colour (defaults to gray). */
	tint?: UITint | undefined;
}

/**
 * Get the typography class for a component from its typographic variant props.
 *
 * @param props Typographic variant props (font, weight, size, tint, alignment).
 * @returns The combined typography class string, or `undefined` when no variants apply.
 * @example getTypographyClass({ font: "title", size: "large", center: true })
 * @see https://dhoulb.github.io/shelving/ui/style/Typography/getTypographyClass
 */
export function getTypographyClass({ tint, size, font, weight, ...props }: TypographyVariants): string | undefined {
	return getModuleClass(TYPOGRAPHY_CSS, tint && `tint-${tint}`, weight && `weight-${weight}`, size, font, props);
}
