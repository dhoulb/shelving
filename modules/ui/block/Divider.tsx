import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getClass, getModuleClass } from "../util/css.js";
import DIVIDER_CSS from "./Divider.module.css";

/**
 * CSS class applied to the root `<hr>` element of every `Divider`.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Divider/DIVIDER_CLASS
 */
export const DIVIDER_CLASS = getModuleClass(DIVIDER_CSS, "divider");

/**
 * CSS class that styles `<hr>` elements when they appear inside `Prose`.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Divider/DIVIDER_PROSE_CLASS
 */
export const DIVIDER_PROSE_CLASS = getModuleClass(DIVIDER_CSS, "prose");

/**
 * Props for `Divider` — space and colour variants.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Divider/DividerProps
 */
export interface DividerProps extends SpaceVariants, ColorVariants {}

/**
 * Horizontal rule separating blocks of content — rendered as `<hr>`.
 *
 * @example <Divider />
 * @see https://dhoulb.github.io/shelving/ui/block/Divider/Divider
 */
export function Divider(props: DividerProps) {
	return (
		<hr
			className={getClass(
				DIVIDER_CLASS, //
				getSpaceClass(props),
				getColorClass(props),
			)}
		/>
	);
}
