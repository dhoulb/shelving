import { getModuleClass } from "../util/css.js";
import PADDING_CSS from "./Padding.module.css";

/**
 * Block-padding variants — opt-in modifiers for the `padding-block` (top + bottom) of a component.
 * Inline padding is left untouched; if you want narrower inline content inside a wide container
 * compose a `<Block narrow>` inside it instead of reducing the inline padding.
 */
export interface PaddingVariants {
	"padding-none"?: boolean | undefined;
	"padding-xxsmall"?: boolean | undefined;
	"padding-xsmall"?: boolean | undefined;
	"padding-small"?: boolean | undefined;
	"padding-normal"?: boolean | undefined;
	"padding-large"?: boolean | undefined;
	"padding-xlarge"?: boolean | undefined;
	"padding-xxlarge"?: boolean | undefined;
}

export type Padding = keyof PaddingVariants;

export function getPaddingClass(padding: Padding | PaddingVariants): string | undefined {
	return getModuleClass(PADDING_CSS, padding);
}

export { PADDING_CSS };
