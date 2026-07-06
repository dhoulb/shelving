/// <reference types="react/canary" />
import { type ReactElement, ViewTransition } from "react";
import { getClass, getModuleClass } from "../util/css.js";
import type { ChildProps } from "../util/props.js";
import TRANSITION_CSS from "./Transition.module.css";

const TRANSITION_OVERLAY_CLASS = getModuleClass(TRANSITION_CSS, "overlay");

/**
 * Variant props shared by every transition component.
 *
 * @see https://shelving.cc/ui/TransitionVariants
 */
export interface TransitionVariants {
	/** Render this transition above other transitions (z-index: 100 on the group). */
	overlay?: boolean | undefined;
}

/**
 * React props for `<Transition>` component.
 *
 * @see https://shelving.cc/ui/TransitionProps
 */
export interface TransitionProps extends ChildProps, TransitionVariants {
	/** The default CSS class. */
	default?: string | undefined;
	/** The CSS class to apply when the transition is moving forward. */
	forward?: string | undefined;
	/** The CSS class to apply when the transition is moving backward. */
	back?: string | undefined;
}

/**
 * Wrap children in a React View Transition, applying the configured transition classes.
 *
 * - Allows known view transition types in `TransitionClasses` (`default`/`forward`/`back`) to be overridden.
 *   - These must correspond to a `::view-transition(.className)` that is set in CSS.
 * - Supports variant classes, e.g. `<Transition overlay>` applies `::view-transition(.overlay)` from `Transition.css`.
 *
 * @kind component
 * @returns A `<ViewTransition>` element wrapping the children.
 * @see https://shelving.cc/ui/Transition
 */
export function Transition({ children, default: d, forward = d, back = d, overlay = false }: TransitionProps): ReactElement {
	return (
		<ViewTransition
			default={{
				default: getClass(d, overlay && TRANSITION_OVERLAY_CLASS),
				forward: getClass(forward, overlay && TRANSITION_OVERLAY_CLASS),
				back: getClass(back, overlay && TRANSITION_OVERLAY_CLASS),
			}}
		>
			{children}
		</ViewTransition>
	);
}
