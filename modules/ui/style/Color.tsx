import { getClass, getModuleClass } from "../util/css.js";
import COLOR_CSS from "./Color.module.css";
import { TINT_CLASS } from "./Tint.js";

/** Possible colour strings. */
export type UIColor =
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

/** Variants for coloring elements, e.g. `color="purple"`. */
export interface ColorVariants {
	/** Colour of the element. */
	color?: UIColor | undefined;
}

/**
 * CSS class that applies color tinting to an element.
 *
 * - Sets the key `.tint-50` color for an element (e.g. `--color-purple` or `--color-primary`) based on `color="purple"` or `color="primary"`
 * - Full set of shades e.g. `--tint-20` and `--tint-95` are created for the selected color.
 * - Element can now compose these shades to style itself using the selected color.
 */
export function getColorClass({ color }: ColorVariants): string | undefined {
	if (color) return getClass(TINT_CLASS, getModuleClass(COLOR_CSS, color));
}
