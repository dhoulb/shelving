import { getModuleClass } from "../util/css.js";
import COLOR_CSS from "./Color.module.css";

/** Variants for raw colours — pure hue overrides independent of semantic status. */
export type ColorVariants = {
	/** Element has primary colors. */
	primary?: boolean | undefined;
	/** Element has secondary colors. */
	secondary?: boolean | undefined;
	/** Element has tertiary colors. */
	tertiary?: boolean | undefined;
	/** Element has quiet colors. */
	quiet?: boolean | undefined;
	/** Element has red colours. */
	red?: boolean | undefined;
	/** Element has orange colours. */
	orange?: boolean | undefined;
	/** Element has yellow colours. */
	yellow?: boolean | undefined;
	/** Element has green colours. */
	green?: boolean | undefined;
	/** Element has cyan colours. */
	cyan?: boolean | undefined;
	/** Element has blue colours. */
	blue?: boolean | undefined;
	/** Element has purple colours. */
	purple?: boolean | undefined;
	/** Element has pink colours. */
	pink?: boolean | undefined;
};

/** Possible colour strings. */
export type Color = keyof ColorVariants;

/** Get a class for a colour. */
export function getColorClass(color: Color | ColorVariants): string | undefined {
	return getModuleClass(COLOR_CSS, color);
}

export { COLOR_CSS };
