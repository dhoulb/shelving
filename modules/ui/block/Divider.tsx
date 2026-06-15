import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getClass, getModuleClass } from "../util/css.js";
import DIVIDER_CSS from "./Divider.module.css";

const DIVIDER_CLASS = getModuleClass(DIVIDER_CSS, "divider");

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
