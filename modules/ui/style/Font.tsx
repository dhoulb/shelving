import { getModuleClass } from "../util/css.js";
import FONT_CSS from "./Font.module.css";

/**
 * Allowed values for font family for components that support [`FontVariants`](/ui/FontVariants)
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Font/FontValue
 */
export type FontValue = "title" | "body" | "label" | "code" | "serif" | "sans" | "monospace";

/**
 * Variant props for the font family of an element, e.g. `font="title"`.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Font/FontVariants
 */
export interface FontVariants {
	/** Font family of the element. */
	font?: FontValue | undefined;
}

/**
 * Get the font-family class for a component from its `font` variant prop.
 *
 * @param variants
 * @returns The font class string, or `undefined` when no `font` is set.
 * @example getFontClass({ font: "title" }) // "title"
 * @see https://dhoulb.github.io/shelving/ui/style/Font/getFontClass
 */
export function getFontClass({ font }: FontVariants): string | undefined {
	return font && getModuleClass(FONT_CSS, font);
}
