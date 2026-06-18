/// <reference types="react/canary" />
import { type ReactElement, ViewTransition } from "react";
import { getClass } from "../util/css.js";
import type { ChildProps } from "../util/props.js";
import type { TransitionClasses } from "./util.js";
import "./Transition.css";

/**
 * Variant props shared by every transition component.
 *
 * @see https://dhoulb.github.io/shelving/ui/transition/Transition/TransitionProps
 */
export interface TransitionProps extends ChildProps {
	/** Render this transition above other transitions (z-index: 100 on the group). */
	overlay?: boolean | undefined;
}

/**
 * Wrap children in a React View Transition, applying the configured transition classes.
 *
 * - Allows known view transition types in [`TransitionClasses`](/ui/TransitionClasses) (`default`/`forward`/`back`) to be overridden.
 *   - These must correspond to a `::view-transition(.className)` that is set in CSS.
 * - Supports variant classes, e.g. `<Transition overlay>` applies `::view-transition(.overlay)` from `Transition.css`.
 *
 * @kind component
 * @param props Transition class overrides (`default`/`forward`/`back`) plus `children` and variant props.
 * @returns A `<ViewTransition>` element wrapping the children.
 * @example <Transition default="fade">{content}</Transition>
 * @see https://dhoulb.github.io/shelving/ui/transition/Transition/Transition
 */
export function Transition({
	children,
	default: d,
	forward = d,
	back = d,
	...variants
}: Partial<TransitionClasses> & TransitionProps): ReactElement {
	const classes: TransitionClasses = {
		default: getClass(d, variants),
		forward: getClass(forward, variants),
		back: getClass(back, variants),
	};
	return <ViewTransition default={classes}>{children}</ViewTransition>;
}
