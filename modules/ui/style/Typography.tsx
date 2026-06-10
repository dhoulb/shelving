import { getModuleClass } from "../util/css.js";
import TYPOGRAPHY_CSS from "./Typography.module.css";

/** Font-size variants (prefixed to avoid clashing with Spacing/Padding/Gap scales). */
export type SizeVariants = {
	xxsmall?: boolean | undefined;
	xsmall?: boolean | undefined;
	small?: boolean | undefined;
	normal?: boolean | undefined;
	large?: boolean | undefined;
	xlarge?: boolean | undefined;
	xxlarge?: boolean | undefined;
};

/** Font-family variants. */
export type FontVariants = {
	/** Body font. */
	body?: boolean | undefined;
	/** Code font. */
	code?: boolean | undefined;
	/** Monospace font. */
	monospace?: boolean | undefined;
	/** Sans-serif font. */
	sans?: boolean | undefined;
	/** Serif font. */
	serif?: boolean | undefined;
};

/** Tint variants — set CSS text `color:` to one of the shades of the current text colour (defaults to gray). */
export type TintVariants = {
	"tint-00"?: boolean | undefined;
	"tint-05"?: boolean | undefined;
	"tint-10"?: boolean | undefined;
	"tint-15"?: boolean | undefined;
	"tint-20"?: boolean | undefined;
	"tint-25"?: boolean | undefined;
	"tint-30"?: boolean | undefined;
	"tint-35"?: boolean | undefined;
	"tint-40"?: boolean | undefined;
	"tint-45"?: boolean | undefined;
	"tint-50"?: boolean | undefined;
	"tint-55"?: boolean | undefined;
	"tint-60"?: boolean | undefined;
	"tint-65"?: boolean | undefined;
	"tint-70"?: boolean | undefined;
	"tint-75"?: boolean | undefined;
	"tint-80"?: boolean | undefined;
	"tint-85"?: boolean | undefined;
	"tint-90"?: boolean | undefined;
	"tint-95"?: boolean | undefined;
	"tint-100"?: boolean | undefined;
};

/** Text-alignment variants — opt-in modifiers any prose component can mix in via `getAlignClass()`. */
export type AlignVariants = {
	/** Align text to the start of the line (LTR: left). */
	left?: boolean | undefined;
	/** Centre text horizontally. */
	center?: boolean | undefined;
	/** Align text to the end of the line (LTR: right). */
	right?: boolean | undefined;
};

/** Typography variants — combined font-family + font-size + tint-colour. */
export type TypographyVariants = SizeVariants & FontVariants & TintVariants & AlignVariants;

export function getTypographyClass(variants: TypographyVariants): string | undefined {
	return getModuleClass(TYPOGRAPHY_CSS, variants);
}
