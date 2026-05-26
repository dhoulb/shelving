import { getModuleClass } from "../util/css.js";
import WIDTH_CSS from "./Width.module.css";

/** Width variants — constrain (or unconstrain) a block-level component's max-width. */
export interface WidthVariants {
	/** Constrain to narrow max-width (`--width-narrow`). */
	narrow?: boolean | undefined;
	/** Constrain to wide max-width (`--width-wide`). */
	wide?: boolean | undefined;
	/** Take the full available width — removes any default max-width constraint. */
	full?: boolean | undefined;
}

export type Width = keyof WidthVariants;

export function getWidthClass(width: Width | WidthVariants): string | undefined {
	return getModuleClass(WIDTH_CSS, width);
}
