import { getModuleClass } from "../util/css.js";
import WIDTH_CSS from "./Width.module.css";

/**
 * Enumerated max-inline-size constraints selectable via the `width` variant prop.
 * - `narrow` / `normal` / `wide` — fixed max-widths from the `--width-*` tokens.
 * - `full` — take the full available width, removing any default max-width constraint.
 * - `fit` — shrink to fit the content's intrinsic width (`fit-content`).
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Width/UIWidth
 */
export type UIWidth = "narrow" | "normal" | "wide" | "full" | "fit";

/**
 * Variant props that constrain (or unconstrain) a block-level component's max-width, e.g. `width="narrow"`.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Width/WidthVariants
 */
export interface WidthVariants {
	/** Max-inline-size constraint of the element. */
	width?: UIWidth | undefined;
}

/**
 * Get the max-width class for a component from its `width` variant prop.
 *
 * @returns The width class string, or `undefined` when no `width` is set.
 * @example getWidthClass({ width: "narrow" }) // "narrow"
 * @see https://dhoulb.github.io/shelving/ui/style/Width/getWidthClass
 */
export function getWidthClass({ width }: WidthVariants): string | undefined {
	return width && getModuleClass(WIDTH_CSS, width);
}
