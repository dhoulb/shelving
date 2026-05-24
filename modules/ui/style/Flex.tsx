import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import FLEX_CSS from "./Flex.module.css";

/** Variants for flex layout — opt-in modifiers any component can mix in via `getFlexClass()`. */
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

/** Get the flex class for a component. */
export function getFlexClass(variants: FlexVariants): string | undefined {
	return getModuleClass(FLEX_CSS, "flex", variants);
}

export interface FlexProps extends FlexVariants, OptionalChildProps {}

/**
 * Dumb flex box — wraps children in a `<div>` with the flex class applied. Carries no external
 * spacing of its own; if you need block-level margins around it, wrap in a `<Block>` or set them
 * on the parent. Other components can mix in flex layout directly via `getFlexClass(props)`.
 */
export function Flex({ children, ...variants }: FlexProps): ReactElement {
	return <div className={getFlexClass(variants)}>{children}</div>;
}

export { FLEX_CSS };
