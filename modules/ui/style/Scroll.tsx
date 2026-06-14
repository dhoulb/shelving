import type { ReactElement } from "react";
import { getClass, getModuleClass } from "../util/css.js";
import type { ChildProps } from "../util/index.js";
import SCROLLABLE_CSS from "./Scroll.module.css";
import type { WidthVariants } from "./Width.js";

export const SCROLL_HORIZONTAL_CLASS = getModuleClass(SCROLLABLE_CSS, "horizontal");
export const SCROLL_VERTICAL_CLASS = getModuleClass(SCROLLABLE_CSS, "vertical");

export interface ScrollProps {
	/** Vertical scrolling (defaults to `false`). */
	vertical?: boolean | undefined;
	/** Horizontal scrolling (defaults to `false`). */
	horizontal?: boolean | undefined;
}

export function getScrollClass({ horizontal, vertical }: ScrollProps): string {
	return getClass(
		horizontal && SCROLL_HORIZONTAL_CLASS, //
		vertical && SCROLL_VERTICAL_CLASS,
	);
}

export interface ScrollComponentProps extends ChildProps, ScrollProps, WidthVariants {}

/** Enable horizontal and/or vertical scrolling on an element. */
export function Scroll({ children, ...props }: ScrollComponentProps): ReactElement {
	return <div className={getScrollClass(props)}>{children}</div>;
}
