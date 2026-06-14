import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getClass, getModuleClass } from "../util/css.js";
import DIVIDER_CSS from "./Divider.module.css";

export const DIVIDER_CLASS = getModuleClass(DIVIDER_CSS, "divider");
export const DIVIDER_PROSE_CLASS = getModuleClass(DIVIDER_CSS, "prose");

export interface DividerProps extends SpaceVariants, ColorVariants {}

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
