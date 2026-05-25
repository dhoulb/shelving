import { getModuleClass } from "../util/css.js";
import TYPOGRAPHY_CSS from "./Typography.module.css";

/** Font-size variants (prefixed to avoid clashing with Spacing/Padding/Gap scales). */
export type SizeVariants = {
	"size-xxsmall"?: boolean | undefined;
	"size-xsmall"?: boolean | undefined;
	"size-small"?: boolean | undefined;
	"size-normal"?: boolean | undefined;
	"size-large"?: boolean | undefined;
	"size-xlarge"?: boolean | undefined;
	"size-xxlarge"?: boolean | undefined;
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

/** Typography variants — combined font-family + font-size. */
export type TypographyVariants = SizeVariants & FontVariants;

export function getTypographyClass(variants: TypographyVariants): string | undefined {
	return getModuleClass(TYPOGRAPHY_CSS, variants);
}

export { TYPOGRAPHY_CSS };
