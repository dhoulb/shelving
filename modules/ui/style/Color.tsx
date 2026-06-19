import { getClass, getModuleClass } from "../util/css.js";
import COLOR_CSS from "./Color.module.css";
import { TINT_CLASS } from "./Tint.js";

/**
 * Enumerated colour names selectable via the `color="purple"` prop for components that support that support `ColorVariants`
 * - Applies a tint color to the element.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Color/ColorVariant
 */
export type ColorVariant =
	| "primary"
	| "secondary"
	| "tertiary"
	| "red"
	| "orange"
	| "yellow"
	| "green"
	| "aqua"
	| "blue"
	| "purple"
	| "pink"
	| "gray";

/**
 * Variant props for colouring an element, e.g. `color="purple"`.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Color/ColorVariants
 */
export interface ColorVariants {
	/** Colour of the element. */
	color?: ColorVariant | undefined;
}

/**
 * CSS class that applies color tinting to an element.
 *
 * - Sets the key `.tint-50` color for an element (e.g. `--color-purple` or `--color-primary`) based on `color="purple"` or `color="primary"`
 * - Full set of shades e.g. `--tint-20` and `--tint-95` are created for the selected color.
 * - Element can now compose these shades to style itself using the selected color.
 *
 * @param variants
 * @returns The combined tint + colour class string, or `undefined` when no `color` is set.
 * @example getColorClass({ color: "purple" }) // "tint color-purple"
 * @see https://dhoulb.github.io/shelving/ui/style/Color/getColorClass
 */
export function getColorClass({ color }: ColorVariants): string | undefined {
	if (color) return getClass(TINT_CLASS, getModuleClass(COLOR_CSS, color));
}
