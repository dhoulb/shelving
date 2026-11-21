import type { ReactElement } from "react";
import { type BlockVariants, getBlockClass } from "../style/Block.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ClassProps } from "../util/props.js";
import DIVIDER_CSS from "./Divider.module.css";

const DIVIDER_CLASS = getModuleClass(DIVIDER_CSS, "divider");

/**
 * Props for `Divider` — space and colour variants.
 *
 * @see https://shelving.cc/ui/DividerProps
 */
export interface DividerProps extends BlockVariants, ClassProps {}

/**
 * Horizontal rule separating blocks of content — rendered as `<hr>`.
 *
 * @kind component
 * @see https://shelving.cc/ui/Divider
 */
export function Divider({ className, ...props }: DividerProps): ReactElement {
	return (
		<hr
			className={getClass(
				DIVIDER_CLASS, //
				getBlockClass(props),
				className,
			)}
		/>
	);
}
