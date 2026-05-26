import { getModuleClass } from "../util/css.js";
import SPACING_CSS from "./Spacing.module.css";

/** Block-spacing variants — opt-in modifiers for block-level components. Set `margin-block` (top + bottom). */
export interface SpacingVariants {
	"space-none"?: boolean | undefined;
	"space-xxsmall"?: boolean | undefined;
	"space-xsmall"?: boolean | undefined;
	"space-small"?: boolean | undefined;
	"space-normal"?: boolean | undefined;
	"space-large"?: boolean | undefined;
	"space-xlarge"?: boolean | undefined;
	"space-xxlarge"?: boolean | undefined;
}

/** Possible spacing strings. */
export type Spacing = keyof SpacingVariants;

/** Get the spacing class for a component. */
export function getSpacingClass(spacing: Spacing | SpacingVariants): string | undefined {
	return getModuleClass(SPACING_CSS, spacing);
}
