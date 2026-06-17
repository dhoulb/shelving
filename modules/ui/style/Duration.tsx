import { getModuleClass } from "../util/css.js";
import DURATION_CSS from "./Duration.module.css";

/**
 * Enumerated transition-duration names selectable via the `duration` variant prop.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Duration/UIDuration
 */
export type UIDuration = "fast" | "normal" | "slow";

/**
 * Variant props for the transition duration of an element, e.g. `duration="fast"`.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Duration/DurationVariants
 */
export interface DurationVariants {
	/** Transition duration of the element. */
	duration?: UIDuration | undefined;
}

/**
 * Get the transition-duration class for a component from its `duration` variant prop.
 *
 * @returns The duration class string, or `undefined` when no `duration` is set.
 * @example getDurationClass({ duration: "fast" }) // "duration-fast"
 * @see https://dhoulb.github.io/shelving/ui/style/Duration/getDurationClass
 */
export function getDurationClass({ duration }: DurationVariants): string | undefined {
	return duration && getModuleClass(DURATION_CSS, `duration-${duration}`);
}
