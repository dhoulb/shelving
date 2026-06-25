import { getModuleClass } from "../util/css.js";
import GAP_CSS from "./Gap.module.css";
import type { SpaceValue } from "./Space.js";

/**
 * Variant props for the gap between a component's children, e.g. `gap="large"`.
 *
 * @see https://shelving.cc/ui/GapVariants
 */
export interface GapVariants {
	/** Gap between child elements. */
	gap?: SpaceValue | undefined;
}

/**
 * Get the gap class for a component from its `gap` variant prop.
 *
 * @returns The gap class string, or `undefined` when no `gap` is set.
 * @example getGapClass({ gap: "large" }) // "large"
 * @see https://shelving.cc/ui/getGapClass
 */
export function getGapClass({ gap }: GapVariants): string | undefined {
	return gap && getModuleClass(GAP_CSS, `gap-${gap}`);
}
