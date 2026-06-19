import { getModuleClass } from "../util/css.js";
import DURATION_CSS from "./Duration.module.css";

/**
 * Allowed values for transition timing for components that support [`DurationVariants`](/ui/DurationVariants)
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Duration/DurationValue
 */
export type DurationValue = "fast" | "normal" | "slow";

/**
 * Variant props for the transition duration of an element, e.g. `duration="fast"`.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Duration/DurationVariants
 */
export interface DurationVariants {
	/** Transition duration of the element. */
	duration?: DurationValue | undefined;
}

/**
 * Get the transition-duration class for a component from its `duration` variant prop.
 *
 * @param variants
 * @returns The duration class string, or `undefined` when no `duration` is set.
 * @example getDurationClass({ duration: "fast" }) // "duration-fast"
 * @see https://dhoulb.github.io/shelving/ui/style/Duration/getDurationClass
 */
export function getDurationClass({ duration }: DurationVariants): string | undefined {
	return duration && getModuleClass(DURATION_CSS, `duration-${duration}`);
}
