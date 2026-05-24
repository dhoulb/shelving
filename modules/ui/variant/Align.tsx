import { getModuleClass } from "../util/css.js";
import ALIGN_CSS from "./Align.module.css";

/** Text-alignment variants — opt-in modifiers any prose component can mix in via `getAlignClass()`. */
export interface AlignVariants {
	/** Align text to the start of the line (LTR: left). */
	left?: boolean | undefined;
	/** Centre text horizontally. */
	center?: boolean | undefined;
	/** Align text to the end of the line (LTR: right). */
	right?: boolean | undefined;
}

/** Possible alignment strings. */
export type Align = keyof AlignVariants;

/** Get the alignment class for a component. */
export function getAlignClass(align: Align | AlignVariants): string | undefined {
	return getModuleClass(ALIGN_CSS, align);
}

export { ALIGN_CSS };
