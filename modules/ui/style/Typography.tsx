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

/** Text-colour variants — set `color` to a step of the 5-step scale. Apply on a container (Block, Panel)
 * to tint everything inside via inheritance, or on an individual text block (Heading, Paragraph) to tint
 * just that one. */
export type TextColorVariants = {
	/** Maximum-contrast text — `color: var(--color-black)`. */
	"text-black"?: boolean | undefined;
	/** Dark text (body-text default) — `color: var(--color-dark)`. Picks up variant tint when wrapped in `.red`, `.success`, etc. */
	"text-dark"?: boolean | undefined;
	/** Vivid text — `color: var(--color-vivid)`. Picks up variant tint. */
	"text-vivid"?: boolean | undefined;
	/** Light text — `color: var(--color-light)`. Picks up variant tint. */
	"text-light"?: boolean | undefined;
	/** Page-background-coloured text (for use on dark/vivid surfaces) — `color: var(--color-white)`. */
	"text-white"?: boolean | undefined;
	/** Reset back to inherit so nested elements stop overriding. */
	"text-inherit"?: boolean | undefined;
};

/** Typography variants — combined font-family + font-size + text-colour. */
export type TypographyVariants = SizeVariants & FontVariants & TextColorVariants;

export function getTypographyClass(variants: TypographyVariants): string | undefined {
	return getModuleClass(TYPOGRAPHY_CSS, variants);
}

export { TYPOGRAPHY_CSS };
