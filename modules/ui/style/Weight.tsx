import { getModuleClass } from "../util/css.js";
import WEIGHT_CSS from "./Weight.module.css";

/**
 * Enumerated font-weight names selectable via the `weight` variant prop.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Weight/UIWeight
 */
export type UIWeight = "title" | "body" | "label" | "code" | "normal" | "strong";

/**
 * Variant props for the font weight of an element, e.g. `weight="strong"`.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Weight/WeightVariants
 */
export interface WeightVariants {
	/** Font weight of the element. */
	weight?: UIWeight | undefined;
}

/**
 * Get the font-weight class for a component from its `weight` variant prop.
 *
 * @returns The weight class string, or `undefined` when no `weight` is set.
 * @example getWeightClass({ weight: "strong" }) // "weight-strong"
 * @see https://dhoulb.github.io/shelving/ui/style/Weight/getWeightClass
 */
export function getWeightClass({ weight }: WeightVariants): string | undefined {
	return weight && getModuleClass(WEIGHT_CSS, `weight-${weight}`);
}
