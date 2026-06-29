import { getClass, getModuleClass } from "../util/css.js";
import { type ColorVariants, getColorClass } from "./Color.js";
import type { TintVariant } from "./Tint.js";
import TYPOGRAPHY_CSS from "./Typography.module.css";

/**
 * Allowed values for font size for components that support `TypographyVariants`
 *
 * @see https://shelving.cc/ui/SizeVariant
 */
export type SizeVariant =
	| "xxsmall"
	| "xsmall"
	| "small"
	| "normal"
	| "large"
	| "xlarge"
	| "xxlarge"
	| "xxxlarge"
	| "1x"
	| "2x"
	| "3x"
	| "4x"
	| "5x"
	| "6x"
	| "7x"
	| "8x"
	| "9x"
	| "10x";

/**
 * Allowed values for font weight for components that support `TypographyVariants`
 *
 * @see https://shelving.cc/ui/WeightVariant
 */
export type WeightVariant = "title" | "body" | "label" | "code" | "normal" | "strong";

/**
 * Allowed values for text case for components that support `TypographyVariants`
 *
 * @see https://shelving.cc/ui/CaseVariant
 */
export type CaseVariant = "title" | "body" | "label" | "code" | "upper" | "lower" | "normal";

/**
 * Allowed values for font family for components that support `TypographyVariants`
 *
 * @see https://shelving.cc/ui/FontVariant
 */
export type FontVariant = "title" | "body" | "label" | "code" | "serif" | "sans" | "monospace";

/**
 * Typographic variant props — colour, font-family, weight, case, size, tint, alignment, and wrap, applied via `getTypographyClass()`
 *
 * - Extends `ColorVariants`, so anything that accepts typography also accepts the `color` variant.
 *
 * @see https://shelving.cc/ui/TypographyVariants
 */
export interface TypographyVariants extends ColorVariants {
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
 * Maps the colour, size, weight, font, case, tint, alignment, and wrap variant props to their CSS classes — the `color` variant is composed in via `getColorClass()`.
 *
 * @returns The combined typography class string (empty when no variants apply).
 * @example getTypographyClass({ font: "title", size: "large", center: true })
 * @example getTypographyClass({ color: "purple", tint: "40" })
 * @see https://shelving.cc/ui/getTypographyClass
 */
export function getTypographyClass({ tint, weight, font, case: caseValue, size, ...props }: TypographyVariants): string {
	return getClass(
		getColorClass(props),
		getModuleClass(
			TYPOGRAPHY_CSS,
			caseValue && `case-${caseValue}`,
			tint && `tint-${tint}`,
			weight && `weight-${weight}`,
			font && `font-${font}`,
			size && `size-${size}`,
			props,
		),
	);
}
