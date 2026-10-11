import type { ReactElement } from "react";
import { type BlockVariants, getBlockClass } from "../style/Block.js";
import { type GridVariants, getGridClass } from "../style/Grid.js";
import { getClass } from "../util/css.js";
import type { ClassProps, OptionalChildProps } from "../util/index.js";
import type { BlockElement } from "./Block.js";

/**
 * Props for the `<Grid>` component.
 *
 * @see https://shelving.cc/ui/GridProps
 */
export interface GridProps extends BlockVariants, GridVariants, OptionalChildProps, ClassProps {
	/**
	 * Element this `<Grid>` renders as, e.g. "ul" to output a "<ul>"
	 * @default "div"
	 */
	as?: BlockElement | "ul" | "ol" | undefined;
}

/**
 * Grid container that arranges its children in equal-width columns.
 *
 * @kind component
 * @see https://shelving.cc/ui/Grid
 */
export function Grid({ as: Element = "div", children, className, ...props }: GridProps): ReactElement {
	return (
		<Element
			className={getClass(
				getBlockClass(props), //
				getGridClass(props),
				className,
			)}
		>
			{children}
		</Element>
	);
}
