import { getModuleClass } from "../util/css.js";
import PADDING_CSS from "./Padding.module.css";
import type { SpaceValue } from "./Space.js";

/**
 * Variant props for the block-padding (top + bottom) of a component, e.g. `padding="large"`.
 *
 * @see https://shelving.cc/ui/PaddingVariants
 */
export interface PaddingVariants {
	/** Block-padding (top + bottom) of the element. */
	padding?: SpaceValue | undefined;
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
