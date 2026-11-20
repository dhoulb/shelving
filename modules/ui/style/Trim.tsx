import { getModuleClass } from "../util/css.js";
import TRIM_CSS from "./Trim.module.css";

/**
 * Variant props to trim the outer margins of a component's first and last children, e.g. `trim`.
 *
 * @see https://shelving.cc/ui/TrimVariants
 */
export interface TrimVariants {
	/** Trim the start margin of the first child and the end margin of the last child. */
	trim?: boolean | undefined;
}

/**
 * Get the trim class for a component from its `trim` variant prop.
 *
 * @returns The trim class string, or `undefined` when `trim` is not set.
 * @example getTrimClass({ trim: true }) // "trim"
 * @see https://shelving.cc/ui/getTrimClass
 */
export function getTrimClass({ trim }: TrimVariants): string | undefined {
	return trim ? getModuleClass(TRIM_CSS, "trim") : undefined;
}
