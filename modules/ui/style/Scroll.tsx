import type { ReactElement } from "react";
import { getClass, getModuleClass } from "../util/css.js";
import type { ChildProps } from "../util/index.js";
import SCROLLABLE_CSS from "./Scroll.module.css";

const SCROLL_HORIZONTAL_CLASS = getModuleClass(SCROLLABLE_CSS, "horizontal");
const SCROLL_VERTICAL_CLASS = getModuleClass(SCROLLABLE_CSS, "vertical");
const SCROLL_COVER_CLASS = getModuleClass(SCROLLABLE_CSS, "cover");
const SCROLL_REVERSE_CLASS = getModuleClass(SCROLLABLE_CSS, "reverse");

/**
 * Variant props for a scroll region: which axes scroll, plus `cover` and `reverse`.
 *
 * @see https://shelving.cc/ui/ScrollVariants
 */
export interface ScrollVariants {
	/** Vertical scrolling (defaults to `false`). */
	vertical?: boolean | undefined;
	/** Horizontal scrolling (defaults to `false`). */
	horizontal?: boolean | undefined;
	/** Cover the nearest positioned ancestor (`position: absolute; inset: 0`), for example a layout's content slot (defaults to `false`). */
	cover?: boolean | undefined;
	/** Start at the end and stay there as the content grows, for example a chat (defaults to `false`). Put the content in one child. */
	reverse?: boolean | undefined;
}

/**
 * Get the scroll class for a component from its `horizontal`, `vertical`, `cover` and `reverse` variant props.
 *
 * @returns The combined scroll class string (empty when neither axis is enabled).
 * @example getScrollClass({ horizontal: true }) // "horizontal"
 * @see https://shelving.cc/ui/getScrollClass
 */
export function getScrollClass({ horizontal, vertical, cover, reverse }: ScrollVariants): string {
	return getClass(
		horizontal && SCROLL_HORIZONTAL_CLASS, //
		vertical && SCROLL_VERTICAL_CLASS,
		cover && SCROLL_COVER_CLASS,
		reverse && SCROLL_REVERSE_CLASS,
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
 * - With `cover`, it fills a layout's content slot, so each page in a `<RouteCache>` scrolls in its own box.
 *
 * @returns A `<div>` element with the computed scroll class.
 * @kind component
 * @see https://shelving.cc/ui/Scroll
 */
export function Scroll({ children, ...props }: ScrollComponentProps): ReactElement {
	return <div className={getScrollClass(props)}>{children}</div>;
}
