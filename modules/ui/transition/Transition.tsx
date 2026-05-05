import { type ReactElement, type ReactNode, ViewTransition } from "react";
import { getClass } from "../util/css.js";
import type { TransitionClasses } from "./util.js";
import "./Transition.css";

/** Variants that can be applied to any transition component. */
export interface TransitionProps {
	children: ReactNode;
	/** Render this transition above other transitions (z-index: 100 on the group). */
	overlay?: boolean | undefined;
}

/**
 * Create a View Transition for children of this component.
 *
 * - Allows known view transition types in `TransitionClasses` to be set to override.
 *   - These must correspond to a `::view-transition(.className)` that is set in CSS.
 *
 * - Supports variant classes, e.g. `<Transition overlay>` applies `::view-transition(.overlay)` from `Transition.css`
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
