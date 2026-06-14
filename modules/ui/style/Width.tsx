import { getModuleClass } from "../util/css.js";
import WIDTH_CSS from "./Width.module.css";

/**
 * Variant props that constrain (or unconstrain) a block-level component's max-width, e.g. `narrow`.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Width/WidthVariants
 */
export interface WidthVariants {
	/** Constrain to narrow max-width (`--width-narrow`). */
	narrow?: boolean | undefined;
	/** Constrain to wide max-width (`--width-wide`). */
	wide?: boolean | undefined;
	/** Take the full available width — removes any default max-width constraint. */
	full?: boolean | undefined;
}

/**
 * Enumerated width modifier names — the boolean keys of `WidthVariants`.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Width/UIWidth
 */
export type UIWidth = keyof WidthVariants;

/**
 * Get the max-width class for a component from its width variant props.
 *
 * @param width Width variant props selecting the max-width constraint.
 * @returns The width class string, or `undefined` when no width variant is set.
 * @example getWidthClass({ narrow: true }) // "narrow"
 * @see https://dhoulb.github.io/shelving/ui/style/Width/getWidthClass
 */
export function getWidthClass(width: WidthVariants): string | undefined {
	return getModuleClass(WIDTH_CSS, width);
}
