import { getModuleClass } from "../util/css.js";
import PADDING_CSS from "./Padding.module.css";

/**
 * Enumerated block-padding scale selectable via the `padding` variant prop — sets the `padding-block` (top + bottom) of a component.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Padding/UIPadding
 */
export type UIPadding =
	| "none"
	| "xxsmall"
	| "xsmall"
	| "small"
	| "normal"
	| "large"
	| "xlarge"
	| "xxlarge"
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
 * Variant props for the block-padding (top + bottom) of a component, e.g. `padding="large"`.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Padding/PaddingVariants
 */
export interface PaddingVariants {
	/** Block-padding (top + bottom) of the element. */
	padding?: UIPadding | undefined;
}

/**
 * Get the block-padding class for a component from its `padding` variant prop.
 *
 * @returns The padding class string, or `undefined` when no `padding` is set.
 * @example getPaddingClass({ padding: "large" }) // "large"
 * @see https://dhoulb.github.io/shelving/ui/style/Padding/getPaddingClass
 */
export function getPaddingClass({ padding }: PaddingVariants): string | undefined {
	return padding && getModuleClass(PADDING_CSS, padding);
}
