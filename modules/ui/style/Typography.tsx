import { getClass, getModuleClass } from "../util/css.js";
import { type FontVariants, getFontClass } from "./Font.js";
import { getSizeClass, type SizeVariants } from "./Size.js";
import TYPOGRAPHY_CSS from "./Typography.module.css";
import { getWeightClass, type WeightVariants } from "./Weight.js";

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
 * Combines the focused {@link SizeVariants}, {@link WeightVariants}, and {@link FontVariants} interfaces (each backed
 * by its own CSS module) with text alignment and tint colour.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Typography/TypographyVariants
 */
export interface TypographyVariants extends AlignVariants, SizeVariants, WeightVariants, FontVariants {
	/** Set CSS text `color:` to one of the shades of the current tint colour (defaults to gray). */
	tint?: UITint | undefined;
}

/**
 * Get the typography class for a component from its typographic variant props.
 *
 * Composes the focused size, weight, and font helpers with text alignment and tint colour.
 *
 * @param props Typographic variant props (font, weight, size, tint, alignment).
 * @returns The combined typography class string, or `undefined` when no variants apply.
 * @example getTypographyClass({ font: "title", size: "large", center: true })
 * @see https://dhoulb.github.io/shelving/ui/style/Typography/getTypographyClass
 */
export function getTypographyClass({ tint, ...props }: TypographyVariants): string | undefined {
	return getClass(
		getSizeClass(props),
		getWeightClass(props),
		getFontClass(props),
		getModuleClass(TYPOGRAPHY_CSS, tint && `tint-${tint}`, props),
	);
}
