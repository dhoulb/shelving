import { getModuleClass } from "../util/css.js";
import type { TintVariant } from "./Tint.js";
import TYPOGRAPHY_CSS from "./Typography.module.css";

/**
 * Allowed values for font size for components that support `TypographyVariants`
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Typography/SizeVariant
 */
export type SizeVariant = "xxsmall" | "xsmall" | "small" | "normal" | "large" | "xlarge" | "xxlarge";

/**
 * Allowed values for font weight for components that support `TypographyVariants`
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Typography/WeightVariant
 */
export type WeightVariant = "title" | "body" | "label" | "code" | "normal" | "strong";

/**
 * Allowed values for text case for components that support `TypographyVariants`
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Typography/CaseVariant
 */
export type CaseVariant = "title" | "body" | "label" | "code" | "upper" | "lower" | "normal";

/**
 * Allowed values for font family for components that support `TypographyVariants`
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Typography/FontVariant
 */
export type FontVariant = "title" | "body" | "label" | "code" | "serif" | "sans" | "monospace";

/**
 * Typographic variant props — font-family, weight, case, size, tint, alignment, and wrap, applied via `getTypographyClass()`
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Typography/TypographyVariants
 */
export interface TypographyVariants {
	/** Font size of the element. */
	size?: SizeVariant | undefined;
	/** Set CSS text `color:` to one of the shades of the current tint ladder. */
	tint?: TintVariant | undefined;
	/** Font family of the element. */
	font?: FontVariant | undefined;
	/** Text case of the element. */
	case?: CaseVariant | undefined;
	/** Font weight of the element. */
	weight?: WeightVariant | undefined;
	/** Align text to the start of the line (LTR: left). */
	left?: boolean | undefined;
	/** Centre text horizontally. */
	center?: boolean | undefined;
	/** Align text to the end of the line (LTR: right). */
	right?: boolean | undefined;
	/** Enable wrapping. */
	wrap?: boolean | undefined;
	/** Disable wrapping. */
	nowrap?: boolean | undefined;
}

/**
 * Get the typography class for a component from its typographic variant props.
 *
 * Maps the size, weight, font, case, tint, alignment, and wrap variant props to their CSS classes.
 *
 * @returns The combined typography class string, or `undefined` when no variants apply.
 * @example getTypographyClass({ font: "title", size: "large", center: true })
 * @see https://dhoulb.github.io/shelving/ui/style/Typography/getTypographyClass
 */
export function getTypographyClass({ tint, weight, font, case: caseValue, size, ...props }: TypographyVariants): string | undefined {
	return getModuleClass(
		TYPOGRAPHY_CSS,
		caseValue && `case-${caseValue}`,
		tint && `tint-${tint}`,
		weight && `weight-${weight}`,
		font && `font-${font}`,
		size && `size-${size}`,
		props,
	);
}
