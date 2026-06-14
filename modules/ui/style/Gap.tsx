import { getModuleClass } from "../util/css.js";
import GAP_CSS from "./Gap.module.css";

/**
 * Enumerated gap scale selectable via the `gap` variant prop — sets `gap` on flex/grid containers and List/Definitions item spacing.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Gap/CSSGap
 */
export type CSSGap = "none" | "xxsmall" | "xsmall" | "small" | "normal" | "large" | "xlarge" | "xxlarge";

/**
 * Variant props for the gap between a component's children, e.g. `gap="large"`.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Gap/GapVariants
 */
export interface GapVariants {
	/** Gap between child elements. */
	gap?: CSSGap | undefined;
}

/**
 * Get the gap class for a component from its `gap` variant prop.
 *
 * @param variants Variant props containing the optional `gap` scale.
 * @returns The gap class string, or `undefined` when no `gap` is set.
 * @example getGapClass({ gap: "large" }) // "large"
 * @see https://dhoulb.github.io/shelving/ui/style/Gap/getGapClass
 */
export function getGapClass({ gap }: GapVariants): string | undefined {
	return gap && getModuleClass(GAP_CSS, gap);
}
