import { type BlockVariants, getBlockClass } from "../style/Block.js";
import { getClass, getModuleClass } from "../util/css.js";
import DIVIDER_CSS from "./Divider.module.css";

const DIVIDER_CLASS = getModuleClass(DIVIDER_CSS, "divider");

/**
 * Props for `Divider` — space and colour variants.
 *
 * @see https://shelving.cc/ui/DividerProps
 */
export interface DividerProps extends BlockVariants {}

/**
 * Horizontal rule separating blocks of content — rendered as `<hr>`.
 *
 * @example <Divider />
 * @see https://shelving.cc/ui/Divider
 */
export function Divider(props: DividerProps) {
	return (
		<hr
			className={getClass(
				DIVIDER_CLASS, //
				getBlockClass(props),
			)}
		/>
	);
}
