import type { ReactElement } from "react";
import { getBlockClass } from "../style/Block.js";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import { getClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/index.js";
import type { BlockElement } from "./Block.js";

/**
 * Props for the `<Row>` component.
 *
 * @see https://shelving.cc/ui/RowProps
 */
export interface RowProps extends FlexVariants, OptionalChildProps {
	/**
	 * Element this `<Row>` renders as, e.g. "header" to output a "<header>"
	 * @default "div"
	 */
	as?: BlockElement | undefined;
}

/**
 * Flex container that arranges its children as a row by default.
 *
 * @param variants
 * @returns A `<div>` element with the computed block/flex class.
 * @kind component
 * @example <Row gap="small" center>{items}</Row>
 * @see https://shelving.cc/ui/Row
 */
export function Row({ as: Element = "div", children, ...props }: RowProps): ReactElement {
	return (
		<Element
			className={getClass(
				getBlockClass(props), //
				getFlexClass(props),
			)}
		>
			{children}
		</Element>
	);
}
