import { getModuleClass } from "../util/css.js";
import SPACE_CSS from "./Space.module.css";

/**
 * Enumerated block-space scale selectable via the `space` variant prop — sets the `margin-block` (top + bottom) of a block-level component.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Space/UISpace
 */
export type UISpace = "none" | "xxsmall" | "xsmall" | "small" | "normal" | "large" | "xlarge" | "xxlarge";

/**
 * Variant props for the block-space (top + bottom margin) of a block-level component, e.g. `space="large"`.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Space/SpaceVariants
 */
export interface SpaceVariants {
	/** Block-space (top + bottom margin) of the element. */
	space?: UISpace | undefined;
}

/**
 * Get the block-space class for a component from its `space` variant prop.
 *
 * @param variants Variant props containing the optional `space` scale.
 * @returns The space class string, or `undefined` when no `space` is set.
 * @example getSpaceClass({ space: "large" }) // "large"
 * @see https://dhoulb.github.io/shelving/ui/style/Space/getSpaceClass
 */
export function getSpaceClass({ space }: SpaceVariants): string | undefined {
	return space && getModuleClass(SPACE_CSS, space);
}
