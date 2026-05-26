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
 * just that one. Reads naturally with Color/Status variants — `<Heading red vivid>` or `<Paragraph black>`. */
export type TextColorVariants = {
	/** Maximum-contrast text — `color: var(--color-black)`. */
	black?: boolean | undefined;
	/** Dark text (body-text default) — `color: var(--color-dark)`. Picks up variant tint when wrapped in `.red`, `.success`, etc. */
	dark?: boolean | undefined;
	/** Vivid text — `color: var(--color-vivid)`. Picks up variant tint. */
	vivid?: boolean | undefined;
	/** Light text — `color: var(--color-light)`. Picks up variant tint. */
	light?: boolean | undefined;
	/** Page-background-coloured text (for use on dark/vivid surfaces) — `color: var(--color-white)`. */
	white?: boolean | undefined;
};

/** Typography variants — combined font-family + font-size + text-colour. */
export type TypographyVariants = SizeVariants & FontVariants & TextColorVariants;

export function getTypographyClass(variants: TypographyVariants): string | undefined {
	return getModuleClass(TYPOGRAPHY_CSS, variants);
}
