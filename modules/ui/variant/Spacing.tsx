import { getModuleClass } from "../util/css.js";
import SPACING_CSS from "./Spacing.module.css";

/** Block-spacing variants — opt-in modifiers for block-level components. */
export interface SpacingVariants {
	/** Add extra vertical breathing room above and below. */
	spacious?: boolean | undefined;
}

/** Possible spacing strings. */
export type Spacing = keyof SpacingVariants;

/** Get the spacing class for a component. */
export function getSpacingClass(spacing: Spacing | SpacingVariants): string | undefined {
	return getModuleClass(SPACING_CSS, spacing);
}

export { SPACING_CSS };
