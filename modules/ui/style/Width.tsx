import { getModuleClass } from "../util/css.js";
import WIDTH_CSS from "./Width.module.css";

/**
 * Enumerated width selectable via the `width` variant prop.
 * - `narrow` / `normal` / `wide` — fixed widths from the `--width-*` tokens (capped at 100%).
 * - `full` — take the full available width.
 * - `fit` — shrink to fit the content's intrinsic width (`fit-content`).
 *
 * @see https://shelving.cc/ui/WidthVariant
 */
export type WidthVariant = "xxnarrow" | "xnarrow" | "narrow" | "normal" | "wide" | "xwide" | "xxwide" | "full" | "fit";

/**
 * Variant props that set (or unconstrain) a component's width, e.g. `width="narrow"` or `width="12x"`.
 *
 * @see https://shelving.cc/ui/WidthVariants
 */
export interface WidthVariants {
	/** Width of the element. */
	width?: WidthVariant | undefined;
	/** Let the element grow past its `width` instead of staying exact. */
	grow?: boolean | undefined;
}

/**
 * Get the width class for a component from its `width` / `grow` variant props.
 *
 * @returns The width class string, or `undefined` if no width variants are set.
 * @example getWidthClass({ width: "narrow" }) // "width narrow"
 * @see https://shelving.cc/ui/getWidthClass
 */
export function getWidthClass({ width, grow }: WidthVariants): string | undefined {
	if (width || grow) return getModuleClass(WIDTH_CSS, "width", width && `width-${width}`, grow && "grow");
}
