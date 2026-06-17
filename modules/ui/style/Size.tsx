import { getModuleClass } from "../util/css.js";
import SIZE_CSS from "./Size.module.css";

/**
 * Enumerated font-size scale selectable via the `size` variant prop.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Size/UISize
 */
export type UISize = "xxsmall" | "xsmall" | "small" | "normal" | "large" | "xlarge" | "xxlarge";

/**
 * Variant props for the font size of an element, e.g. `size="large"`.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Size/SizeVariants
 */
export interface SizeVariants {
	/** Font size of the element. */
	size?: UISize | undefined;
}

/**
 * Get the font-size class for a component from its `size` variant prop.
 *
 * @returns The size class string, or `undefined` when no `size` is set.
 * @example getSizeClass({ size: "large" }) // "large"
 * @see https://dhoulb.github.io/shelving/ui/style/Size/getSizeClass
 */
export function getSizeClass({ size }: SizeVariants): string | undefined {
	return size && getModuleClass(SIZE_CSS, size);
}
