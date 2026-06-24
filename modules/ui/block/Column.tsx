import type { ReactElement } from "react";
import { type BlockVariants, getBlockClass } from "../style/Block.js";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import { getClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/index.js";
import type { BlockElement } from "./Block.js";

/**
 * Props for the `<Column>` component.
 *
 * @see https://shelving.cc/ui/ColumnProps
 */
export interface ColumnProps extends BlockVariants, FlexVariants, OptionalChildProps {
	/**
	 * Element this `<Column>` renders as, e.g. "header" to output a "<header>"
	 * @default "div"
	 */
	as?: BlockElement | undefined;
}

/**
 * Flex container that stacks its children as a column by default.
 *
 * @param variants
 * @returns A `<div>` element with the computed block/flex class.
 * @kind component
 * @example <Column gap="small">{items}</Column>
 * @see https://shelving.cc/ui/Column
 */
export function Column({ as: Element = "div", children, column = true, ...props }: ColumnProps): ReactElement {
	return (
		<Element
			className={getClass(
				getBlockClass(props), //
				getFlexClass({ column, ...props }),
			)}
		>
			{children}
		</Element>
	);
}
