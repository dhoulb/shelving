import { getModuleClass } from "../util/css.js";
import PADDING_CSS from "./Padding.module.css";

/**
 * Allowed values for padding for components that support `PaddingVariants`
 *
 * @see https://shelving.cc/ui/PaddingVariant
 */
export type PaddingVariant =
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
 * @see https://shelving.cc/ui/PaddingVariants
 */
export interface PaddingVariants {
	/** Block-padding (top + bottom) of the element. */
	padding?: PaddingVariant | undefined;
}

/**
 * Get the block-padding class for a component from its `padding` variant prop.
 *
 * @param variants
 * @returns The padding class string, or `undefined` when no `padding` is set.
 * @example getPaddingClass({ padding: "large" }) // "large"
 * @see https://shelving.cc/ui/getPaddingClass
 */
export function getPaddingClass({ padding }: PaddingVariants): string | undefined {
	return padding && getModuleClass(PADDING_CSS, `padding-${padding}`);
}
