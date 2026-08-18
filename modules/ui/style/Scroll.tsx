import type { ReactElement } from "react";
import { getClass, getModuleClass } from "../util/css.js";
import type { ChildProps } from "../util/index.js";
import SCROLLABLE_CSS from "./Scroll.module.css";

const SCROLL_HORIZONTAL_CLASS = getModuleClass(SCROLLABLE_CSS, "horizontal");
const SCROLL_VERTICAL_CLASS = getModuleClass(SCROLLABLE_CSS, "vertical");

/**
 * Variant props selecting which scroll axes are enabled on an element.
 *
 * @see https://shelving.cc/ui/ScrollProps
 */
export interface ScrollVariants {
	/** Vertical scrolling (defaults to `false`). */
	vertical?: boolean | undefined;
	/** Horizontal scrolling (defaults to `false`). */
	horizontal?: boolean | undefined;
}

/**
 * Get the scroll class for a component from its `horizontal` / `vertical` variant props.
 *
 * @returns The combined scroll class string (empty when neither axis is enabled).
 * @example getScrollClass({ horizontal: true }) // "horizontal"
 * @see https://shelving.cc/ui/getScrollClass
 */
export function getScrollClass({ horizontal, vertical }: ScrollVariants): string {
	return getClass(
		horizontal && SCROLL_HORIZONTAL_CLASS, //
		vertical && SCROLL_VERTICAL_CLASS,
	);
}

/**
 * Props for the `Scroll` component — children plus scroll-axis variants.
 *
 * @see https://shelving.cc/ui/ScrollComponentProps
 */
export interface ScrollComponentProps extends ChildProps, ScrollVariants {}

/**
 * Wrap children in a scrollable container with horizontal and/or vertical scrolling enabled.
 *
 * @returns A `<div>` element with the computed scroll class.
 * @kind component
 * @example <Scroll horizontal>{wideContent}</Scroll>
 * @see https://shelving.cc/ui/Scroll
 */
export function Scroll({ children, ...props }: ScrollComponentProps): ReactElement {
	return <div className={getScrollClass(props)}>{children}</div>;
}
