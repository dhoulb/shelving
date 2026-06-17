import { getModuleClass } from "../util/css.js";
import WIDTH_CSS from "./Width.module.css";

/**
 * Enumerated inline-size selectable via the `width` variant prop.
 * - `narrow` / `normal` / `wide` — fixed widths from the `--width-*` tokens (capped at 100%).
 * - `full` — take the full available width.
 * - `fit` — shrink to fit the content's intrinsic width (`fit-content`).
 * - `1x` … `128x` — exact widths that are multiples of `--space-normal` (16px), following the spacing scale (`1x`–`8x` in single steps, then `10x`/`12x`/`14x`/`16x`, `20x`/`24x`/`28x`/`32x`, then `40x` … `128x` in eights).
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Width/UIWidth
 */
export type UIWidth =
	| "narrow"
	| "normal"
	| "wide"
	| "full"
	| "fit"
	| "1x"
	| "2x"
	| "3x"
	| "4x"
	| "5x"
	| "6x"
	| "7x"
	| "8x"
	| "10x"
	| "12x"
	| "14x"
	| "16x"
	| "20x"
	| "24x"
	| "28x"
	| "32x"
	| "40x"
	| "48x"
	| "56x"
	| "64x"
	| "72x"
	| "80x"
	| "88x"
	| "96x"
	| "104x"
	| "112x"
	| "120x"
	| "128x";

/**
 * Variant props that set (or unconstrain) a component's inline-size, e.g. `width="narrow"` or `width="12x"`.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Width/WidthVariants
 */
export interface WidthVariants {
	/** Inline-size of the element. */
	width?: UIWidth | undefined;
	/**
	 * Let the element grow past its `width` instead of staying exact.
	 * - Turns the chosen `width` into a floor (`min-inline-size`) and adds `flex-grow: 1` so the element expands to fill the available space when it's a flex item or table column.
	 */
	grow?: boolean | undefined;
}

/**
 * Get the inline-size class for a component from its `width` / `grow` variant props.
 *
 * @returns The width class string, or `undefined` when neither `width` nor `grow` is set.
 * @example getWidthClass({ width: "narrow" }) // "width narrow"
 * @example getWidthClass({ width: "12x", grow: true }) // "width 12x grow"
 * @see https://dhoulb.github.io/shelving/ui/style/Width/getWidthClass
 */
export function getWidthClass({ width, grow }: WidthVariants): string | undefined {
	if (!width && !grow) return undefined;
	return getModuleClass(WIDTH_CSS, "width", width, { grow });
}
