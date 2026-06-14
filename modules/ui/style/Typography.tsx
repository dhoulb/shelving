import { getModuleClass } from "../util/css.js";
import TYPOGRAPHY_CSS from "./Typography.module.css";

/** Possible font-size strings. */
export type UISize = "xxsmall" | "xsmall" | "small" | "normal" | "large" | "xlarge" | "xxlarge";

/** Possible font-family strings. */
export type UIFont = "title" | "body" | "label" | "code" | "serif" | "sans" | "monospace";

/** Possible font weight strings. */
export type UIWeight = "title" | "body" | "label" | "code" | "normal" | "strong";

/** Possible tint strings — shades of the current tint colour from `"00"` (black) through `"50"` (the hue itself) to `"100"` (white). */
export type UITint =
	| "00"
	| "05"
	| "10"
	| "15"
	| "20"
	| "25"
	| "30"
	| "35"
	| "40"
	| "45"
	| "50"
	| "55"
	| "60"
	| "65"
	| "70"
	| "75"
	| "80"
	| "85"
	| "90"
	| "95"
	| "100";

/** Text-alignment variants — opt-in modifiers any prose component can mix in via `getTypographyClass()`. */
export type AlignVariants = {
	/** Align text to the start of the line (LTR: left). */
	left?: boolean | undefined;
	/** Centre text horizontally. */
	center?: boolean | undefined;
	/** Align text to the end of the line (LTR: right). */
	right?: boolean | undefined;
};

/** Typographic variants — font-family, alignment, size, and tint variants. */
export interface TypographyVariants extends AlignVariants {
	/** Font family. */
	font?: UIFont | undefined;
	/** Font weight */
	weight?: UIWeight | undefined;
	/** Font size of the element. */
	size?: UISize | undefined;
	/** Set CSS text `color:` to one of the shades of the current tint colour (defaults to gray). */
	tint?: UITint | undefined;
}

export function getTypographyClass({ tint, size, font, weight, ...props }: TypographyVariants): string | undefined {
	return getModuleClass(TYPOGRAPHY_CSS, tint && `tint-${tint}`, weight && `weight-${weight}`, size, font, props);
}
