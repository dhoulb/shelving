import { getModuleClass } from "../util/css.js";
import STROKE_CSS from "./Stroke.module.css";

/**
 * Allowed values for border thickness for components that support `StrokeVariants`
 *
 * @see https://shelving.cc/ui/UIStroke
 */
export type StrokeVariant = "normal" | "thick";

/**
 * Variant props for the border thickness of a component, e.g. `stroke="thick"`.
 *
 * @see https://shelving.cc/ui/StrokeVariants
 */
export interface StrokeVariants {
	/** Border thickness of the component. */
	stroke?: StrokeVariant | undefined;
}

/**
 * Get the border-thickness class for a component from its `stroke` variant prop.
 *
 * @param variants
 * @returns The stroke class string, or `undefined` when no `stroke` is set.
 * @example getStrokeClass({ stroke: "thick" }) // "stroke-thick"
 * @see https://shelving.cc/ui/getStrokeClass
 */
export function getStrokeClass({ stroke }: StrokeVariants): string | undefined {
	return stroke && getModuleClass(STROKE_CSS, stroke);
}
