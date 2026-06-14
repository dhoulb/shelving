import { getModuleClass } from "../util/css.js";
import SPACE_CSS from "./Space.module.css";

/** Possible space strings — set the `margin-block` (top + bottom) of a block-level component. */
export type UISpace = "none" | "xxsmall" | "xsmall" | "small" | "normal" | "large" | "xlarge" | "xxlarge";

/** Variants for block-level components with block-space, e.g. `space="large"`. */
export interface SpaceVariants {
	/** Block-space (top + bottom margin) of the element. */
	space?: UISpace | undefined;
}

/** Get the spacing class for a component. */
export function getSpaceClass({ space }: SpaceVariants): string | undefined {
	return space && getModuleClass(SPACE_CSS, space);
}
