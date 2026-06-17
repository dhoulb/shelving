import { getModuleClass } from "../util/css.js";
import FONT_CSS from "./Font.module.css";

/**
 * Enumerated font-family names selectable via the `font` variant prop.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Font/UIFont
 */
export type UIFont = "title" | "body" | "label" | "code" | "serif" | "sans" | "monospace";

/**
 * Variant props for the font family of an element, e.g. `font="title"`.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Font/FontVariants
 */
export interface FontVariants {
	/** Font family of the element. */
	font?: UIFont | undefined;
}

/**
 * Get the font-family class for a component from its `font` variant prop.
 *
 * @returns The font class string, or `undefined` when no `font` is set.
 * @example getFontClass({ font: "title" }) // "title"
 * @see https://dhoulb.github.io/shelving/ui/style/Font/getFontClass
 */
export function getFontClass({ font }: FontVariants): string | undefined {
	return font && getModuleClass(FONT_CSS, font);
}
