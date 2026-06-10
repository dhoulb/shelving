import { getClass, getModuleClass } from "../util/css.js";
import COLOR_CSS from "./Color.module.css";
import { TINT_CLASS } from "./Tint.js";

/** Variants for raw colours — pure hue overrides independent of semantic status. */
export interface ColorVariants {
	/** Element has primary colors. */
	primary?: boolean | undefined;
	/** Element has secondary colors. */
	secondary?: boolean | undefined;
	/** Element has tertiary colors. */
	tertiary?: boolean | undefined;
	/** Element has red colours. */
	red?: boolean | undefined;
	/** Element has orange colours. */
	orange?: boolean | undefined;
	/** Element has yellow colours. */
	yellow?: boolean | undefined;
	/** Element has green colours. */
	green?: boolean | undefined;
	/** Element has aqua colours. */
	aqua?: boolean | undefined;
	/** Element has blue colours. */
	blue?: boolean | undefined;
	/** Element has purple colours. */
	purple?: boolean | undefined;
	/** Element has pink colours. */
	pink?: boolean | undefined;
	/** Element has pink colours. */
	gray?: boolean | undefined;
}

/** Possible colour strings. */
export type Color = keyof ColorVariants;

/** Props for colored elements (either a simple boolean variant e.g. `blue` or a specific `color="purple"`). */
export interface ColorProps extends ColorVariants {
	/** Specific color for the element. */
	color?: Color | undefined;
}

/** Get a class for a colour. */
export function getColorClass(color: ColorProps): string | undefined {
	return getClass(TINT_CLASS, getModuleClass(COLOR_CSS, color?.color, color));
}
