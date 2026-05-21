import type { ReactElement } from "react";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import { BLOCK_CLASS } from "./Block.js";
import FLEX_CSS from "./Flex.module.css";

/** Variants for flex areas. */
export interface FlexVariants {
	/** Wrap overflowing elements onto the next line (defaults to no wrapping). */
	wrap?: boolean | undefined;
	/** Display the elements as a column (defaults to row). */
	column?: boolean | undefined;
	/** Align the elements to the left (defaults to stretch). */
	left?: boolean | undefined;
	/** Align the elements to the center (defaults to stretch). */
	center?: boolean | undefined;
	/** Align the elements to the right (defaults to stretch). */
	right?: boolean | undefined;
	/** Align the elements stretch (defaults to stretch). */
	stretch?: boolean | undefined;
	/** Remove the gap between elements. */
	flush?: boolean | undefined;
	/** Reverse the order of the elements. */
	reverse?: boolean | undefined;
}

export interface FlexProps extends FlexVariants, OptionalChildProps {}

/** Block with flex children. */
export function Flex({ children, ...variants }: FlexProps): ReactElement {
	return (
		<div
			className={getClass(
				BLOCK_CLASS, //
				getModuleClass(FLEX_CSS, "flex", variants),
			)}
		>
			{children}
		</div>
	);
}

export { FLEX_CSS };
