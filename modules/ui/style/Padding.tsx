import { getModuleClass } from "../util/css.js";
import PADDING_CSS from "./Padding.module.css";

/** Possible padding strings to set the `padding-block` (top + bottom) of a component. */
export type UIPadding = "none" | "xxsmall" | "xsmall" | "small" | "normal" | "large" | "xlarge" | "xxlarge";

/** Variants for components with block-padding, e.g. `padding="large"`. */
export interface PaddingVariants {
	/** Block-padding (top + bottom) of the element. */
	padding?: UIPadding | undefined;
}

/** Get a class for a padding. */
export function getPaddingClass({ padding }: PaddingVariants): string | undefined {
	return padding && getModuleClass(PADDING_CSS, padding);
}
