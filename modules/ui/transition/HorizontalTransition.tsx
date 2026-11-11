import type { ReactElement } from "react";
import { getClass, getModuleClass } from "../util/css.js";
import HORIZONTAL_TRANSITION_CSS from "./HorizontalTransition.module.css";
import { Transition, type TransitionProps } from "./Transition.js";

/**
 * View transition class that slides content right: the new content comes in from the right and the old content leaves to the left.
 *
 * - Pass it to React's `<ViewTransition>` (for example `enter` or `exit`) to use this animation without the component.
 * - Also adds the plain global `slide-right` class, so app CSS can target it with `::view-transition-group(.slide-right)`.
 *
 * @see https://shelving.cc/ui/SLIDE_RIGHT_TRANSITION_CLASS
 */
export const SLIDE_RIGHT_TRANSITION_CLASS = getClass("slide-right", getModuleClass(HORIZONTAL_TRANSITION_CSS, "slide-right"));

/**
 * View transition class that slides content left: the new content comes in from the left and the old content leaves to the right.
 *
 * - Pass it to React's `<ViewTransition>` (for example `enter` or `exit`) to use this animation without the component.
 * - Also adds the plain global `slide-left` class, so app CSS can target it with `::view-transition-group(.slide-left)`.
 *
 * @see https://shelving.cc/ui/SLIDE_LEFT_TRANSITION_CLASS
 */
export const SLIDE_LEFT_TRANSITION_CLASS = getClass("slide-left", getModuleClass(HORIZONTAL_TRANSITION_CSS, "slide-left"));

/**
 * Props for the `HorizontalTransition` component — the shared transition variant props.
 *
 * @see https://shelving.cc/ui/HorizontalTransitionProps
 */
export interface HorizontalTransitionProps extends TransitionProps {}

/**
 * Transition that slides its children horizontally — right when moving forward, left when moving back.
 *
 * @kind component
 * @see https://shelving.cc/ui/HorizontalTransition
 */
export function HorizontalTransition(props: HorizontalTransitionProps): ReactElement {
	return (
		<Transition
			default={SLIDE_RIGHT_TRANSITION_CLASS}
			forward={SLIDE_RIGHT_TRANSITION_CLASS}
			back={SLIDE_LEFT_TRANSITION_CLASS}
			{...props}
		/>
	);
}
