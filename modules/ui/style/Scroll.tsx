import type { ReactElement } from "react";
import { getClass, getModuleClass } from "../util/css.js";
import type { ChildProps } from "../util/index.js";
import SCROLLABLE_CSS from "./Scroll.module.css";

const SCROLL_HORIZONTAL_CLASS = getModuleClass(SCROLLABLE_CSS, "horizontal");

const SCROLL_VERTICAL_CLASS = getModuleClass(SCROLLABLE_CSS, "vertical");

/**
 * Variant props selecting which scroll axes are enabled on an element.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Scroll/ScrollProps
 */
export interface ScrollProps {
	/** Vertical scrolling (defaults to `false`). */
	vertical?: boolean | undefined;
	/** Horizontal scrolling (defaults to `false`). */
	horizontal?: boolean | undefined;
}

/**
 * Get the scroll class for a component from its `horizontal` / `vertical` variant props.
 *
 * @param props Scroll variant props selecting the enabled axes.
 * @returns The combined scroll class string (empty when neither axis is enabled).
 * @example getScrollClass({ horizontal: true }) // "horizontal"
 * @see https://dhoulb.github.io/shelving/ui/style/Scroll/getScrollClass
 */
export function getScrollClass({ horizontal, vertical }: ScrollProps): string {
	return getClass(
		horizontal && SCROLL_HORIZONTAL_CLASS, //
		vertical && SCROLL_VERTICAL_CLASS,
	);
}

/**
 * Props for the `Scroll` component — children plus scroll-axis variants.
 *
 * @see https://dhoulb.github.io/shelving/ui/style/Scroll/ScrollComponentProps
 */
export interface ScrollComponentProps extends ChildProps, ScrollProps {}

/**
 * Wrap children in a scrollable container with horizontal and/or vertical scrolling enabled.
 *
 * @param props Children plus scroll-axis variant props.
 * @returns A `<div>` element with the computed scroll class.
 * @example <Scroll horizontal>{wideContent}</Scroll>
 * @see https://dhoulb.github.io/shelving/ui/style/Scroll/Scroll
 */
export function Scroll({ children, ...props }: ScrollComponentProps): ReactElement {
	return <div className={getScrollClass(props)}>{children}</div>;
}
