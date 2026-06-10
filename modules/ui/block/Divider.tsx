import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpacingClass, type SpacingVariants } from "../style/Spacing.js";
import { getClass, getModuleClass } from "../util/css.js";
import DIVIDER_CSS from "./Divider.module.css";

export const DIVIDER_CLASS = getModuleClass(DIVIDER_CSS, "divider");
export const DIVIDER_PROSE_CLASS = getModuleClass(DIVIDER_CSS, "prose");

export interface DividerProps extends SpacingVariants, ColorVariants {}

export function Divider(props: DividerProps) {
	return (
		<hr
			className={getClass(
				DIVIDER_CLASS, //
				getSpacingClass(props),
				getColorClass(props),
			)}
		/>
	);
}
