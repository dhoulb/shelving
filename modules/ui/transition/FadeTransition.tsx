import type { ReactElement } from "react";
import { getClass, getModuleClass } from "../util/css.js";
import FADE_TRANSITION_CSS from "./FadeTransition.module.css";
import { Transition, type TransitionProps } from "./Transition.js";

/**
 * View transition class that fades content in and out.
 *
 * - Pass it to React's `<ViewTransition>` (for example `enter` or `exit`) to use this animation without the component.
 * - Also adds the plain global `fade` class, so app CSS can target it with `::view-transition-group(.fade)`.
 *
 * @see https://shelving.cc/ui/FADE_TRANSITION_CLASS
 */
export const FADE_TRANSITION_CLASS = getClass("fade", getModuleClass(FADE_TRANSITION_CSS, "fade"));

/**
 * Props for the `FadeTransition` component — the shared transition variant props.
 *
 * @see https://shelving.cc/ui/FadeTransitionProps
 */
export interface FadeTransitionProps extends TransitionProps {}

/**
 * Transition that fades its children in and out by animating their opacity.
 *
 * @kind component
 * @see https://shelving.cc/ui/FadeTransition
 */
export function FadeTransition(props: FadeTransitionProps): ReactElement {
	return <Transition default={FADE_TRANSITION_CLASS} {...props} />;
}
