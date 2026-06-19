import { getModuleClass } from "../util/css.js";
import GAP_CSS from "./Gap.module.css";

/**
 * Allowed values for gap spacing for components that support [`GapVariants`](/ui/GapVariants)
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Gap/GapValue
 */
export type GapValue = "none" | "xxsmall" | "xsmall" | "small" | "normal" | "large" | "xlarge" | "xxlarge";

/**
 * Variant props for the gap between a component's children, e.g. `gap="large"`.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Gap/GapVariants
 */
export interface GapVariants {
	/** Gap between child elements. */
	gap?: GapValue | undefined;
}

/**
 * Get the gap class for a component from its `gap` variant prop.
 *
 * @param variants
 * @returns The gap class string, or `undefined` when no `gap` is set.
 * @example getGapClass({ gap: "large" }) // "large"
 * @see https://dhoulb.github.io/shelving/ui/style/Gap/getGapClass
 */
export function getGapClass({ gap }: GapVariants): string | undefined {
	return gap && getModuleClass(GAP_CSS, gap);
}
