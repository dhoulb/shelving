import { getModuleClass } from "../util/css.js";
import TYPOGRAPHY_CSS from "./Typography.module.css";

/** Variants for font size. */
export type SizeVariants = {
	/** Text size is xxsmall. */
	xxsmall?: boolean | undefined;
	/** Text size is xsmall. */
	xsmall?: boolean | undefined;
	/** Text size is small. */
	small?: boolean | undefined;
	/** Text size is small. */
	normal?: boolean | undefined;
	/** Text size is large. */
	large?: boolean | undefined;
	/** Text size is xlarge. */
	xlarge?: boolean | undefined;
	/** Text size is xxlarge. */
	xxlarge?: boolean | undefined;
};

/** Variants for font family. */
export type FontVariants = {
	/** Element has body font. */
	body?: boolean | undefined;
	/** Element has code font. */
	code?: boolean | undefined;
	/** Element has monospace font. */
	monospace?: boolean | undefined;
	/** Element has sans-serif font. */
	sans?: boolean | undefined;
	/** Element has serif font. */
	serif?: boolean | undefined;
};

/** Variants for raw colours — pure hue overrides independent of semantic status. */
export type TypographyVariants = SizeVariants & FontVariants;

export function getTypographyClass(variants: TypographyVariants): string | undefined {
	return getModuleClass(TYPOGRAPHY_CSS, variants);
}
