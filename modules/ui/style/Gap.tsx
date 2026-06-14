import { getModuleClass } from "../util/css.js";
import GAP_CSS from "./Gap.module.css";

/** Possible gap strings — sets `gap` on flex/grid containers and List/Definitions item spacing. */
export type CSSGap = "none" | "xxsmall" | "xsmall" | "small" | "normal" | "large" | "xlarge" | "xxlarge";

/** Variants for components with a gap between their children, e.g. `gap="large"`. */
export interface GapVariants {
	/** Gap between child elements. */
	gap?: CSSGap | undefined;
}

/** Get a class for a gap. */
export function getGapClass({ gap }: GapVariants): string | undefined {
	return gap && getModuleClass(GAP_CSS, gap);
}
