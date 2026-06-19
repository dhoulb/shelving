import { getClass, getModuleClass } from "../util/css.js";
import { type FontVariants, getFontClass } from "./Font.js";
import { getSizeClass, type SizeVariants } from "./Size.js";
import TYPOGRAPHY_CSS from "./Typography.module.css";
import { getWeightClass, type WeightVariants } from "./Weight.js";

/**
 * Shades of the currently selected tint color, from `"00"` (black) through `"50"` (the hue itself) to `"100"` (white).
 * - Can be applied as the text `color:` for components that support `TypographyVariants`
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Typography/TintVariant
 */
export type TintVariant =
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
 * Whitespace wrap variant props — opt-in modifiers any prose component can mix in via `getTypographyClass()`.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Typography/WrapVariants
 */
export type WrapVariants = {
	/** Enable wrapping. */
	wrap?: boolean | undefined;
	/** Disable wrapping. */
	nowrap?: boolean | undefined;
};

/**
 * Typographic variant props — font-family, weight, alignment, size, and tint.
 *
 * Combines the focused {@link SizeVariants}, {@link WeightVariants}, and {@link FontVariants} interfaces (each backed
 * by its own CSS module) with text alignment and tint colour.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Typography/TypographyVariants
 */
export interface TypographyVariants extends AlignVariants, SizeVariants, WeightVariants, FontVariants, WrapVariants {
	/** Set CSS text `color:` to one of the shades of the current tint ladder. */
	tint?: TintVariant | undefined;
}

/**
 * Get the typography class for a component from its typographic variant props.
 *
 * Composes the focused size, weight, and font helpers with text alignment and tint colour.
 *
 * @param variants
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
