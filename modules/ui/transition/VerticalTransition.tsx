import type { ReactElement } from "react";
import { getClass, getModuleClass } from "../util/css.js";
import { Transition, type TransitionProps } from "./Transition.js";
import VERTICAL_TRANSITION_CSS from "./VerticalTransition.module.css";

/**
 * View transition class that slides content down: the new content comes in from the top and the old content leaves to the bottom.
 *
 * - Pass it to React's `<ViewTransition>` (for example `enter` or `exit`) to use this animation without the component.
 * - Also adds the plain global `slide-down` class, so app CSS can target it with `::view-transition-group(.slide-down)`.
 *
 * @see https://shelving.cc/ui/SLIDE_DOWN_TRANSITION_CLASS
 */
export const SLIDE_DOWN_TRANSITION_CLASS = getClass("slide-down", getModuleClass(VERTICAL_TRANSITION_CSS, "slide-down"));

/**
 * View transition class that slides content up: the new content comes in from the bottom and the old content leaves to the top.
 *
 * - Pass it to React's `<ViewTransition>` (for example `enter` or `exit`) to use this animation without the component.
 * - Also adds the plain global `slide-up` class, so app CSS can target it with `::view-transition-group(.slide-up)`.
 *
 * @see https://shelving.cc/ui/SLIDE_UP_TRANSITION_CLASS
 */
export const SLIDE_UP_TRANSITION_CLASS = getClass("slide-up", getModuleClass(VERTICAL_TRANSITION_CSS, "slide-up"));

/**
 * Props for the `VerticalTransition` component — the shared transition variant props.
 *
 * @see https://shelving.cc/ui/VerticalTransitionProps
 */
export interface VerticalTransitionProps extends TransitionProps {}

/**
 * Transition that slides its children vertically — down when moving forward, up when moving back.
 *
 * @kind component
 * @see https://shelving.cc/ui/VerticalTransition
 */
export function VerticalTransition(props: VerticalTransitionProps): ReactElement {
	return (
		<Transition default={SLIDE_DOWN_TRANSITION_CLASS} forward={SLIDE_DOWN_TRANSITION_CLASS} back={SLIDE_UP_TRANSITION_CLASS} {...props} />
	);
}
