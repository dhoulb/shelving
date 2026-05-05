import type { ReactElement, ReactNode } from "react";
import { getClass, getModuleClass } from "../util/css.js";
import { ELEMENT_CSS } from "./Element.js";
import ELEMENTS_CSS from "./Elements.module.css";

/** Variants for elements. */
export interface ElementsVariants {
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

export interface ElementsProps extends ElementsVariants {
	children?: ReactNode | undefined;
}

/** Block with element spacing and flex children. */
export function Elements({ children, ...variants }: ElementsProps): ReactElement {
	return (
		<div
			className={getClass(
				ELEMENT_CSS.element, // Elements has element spacing.
				getModuleClass(ELEMENTS_CSS, "elements", variants),
			)}
		>
			{children}
		</div>
	);
}

export { ELEMENTS_CSS };
