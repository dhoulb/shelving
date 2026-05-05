import type { ReactElement, ReactNode } from "react";
import ELEMENT_CSS from "./Element.module.css";

/** Variants for elements. */
export interface ElementProps {
	children?: ReactNode;
}

/** A single element with element spacing. */
export function Element({ children }: ElementProps): ReactElement {
	return <div className={ELEMENT_CSS.element}>{children}</div>;
}

export { ELEMENT_CSS };
