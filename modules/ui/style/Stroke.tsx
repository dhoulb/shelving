import { getModuleClass } from "../util/css.js";
import STROKE_CSS from "./Stroke.module.css";

/**
 * Enumerated border-thickness names selectable via the `stroke` variant prop.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Stroke/UIStroke
 */
export type UIStroke = "normal" | "thick";

/**
 * Variant props for the border thickness of an element, e.g. `stroke="thick"`.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Stroke/StrokeVariants
 */
export interface StrokeVariants {
	/** Border thickness of the element. */
	stroke?: UIStroke | undefined;
}

/**
 * Get the border-thickness class for a component from its `stroke` variant prop.
 *
 * @param variants Variant props containing the optional `stroke` name.
 * @returns The stroke class string, or `undefined` when no `stroke` is set.
 * @example getStrokeClass({ stroke: "thick" }) // "stroke-thick"
 * @see https://dhoulb.github.io/shelving/ui/style/Stroke/getStrokeClass
 */
export function getStrokeClass({ stroke }: StrokeVariants): string | undefined {
	return stroke && getModuleClass(STROKE_CSS, `stroke-${stroke}`);
}
