import type { ReactElement } from "react";
import "./HorizontalTransition.css";
import { Transition, type TransitionProps } from "./Transition.js";

/**
 * Props for the `HorizontalTransition` component — the shared transition variant props.
 *
 * @see https://dhoulb.github.io/shelving/ui/transition/HorizontalTransition/HorizontalTransitionProps
 */
export interface HorizontalTransitionProps extends TransitionProps {}

/**
 * Transition that slides its children horizontally — right when moving forward, left when moving back.
 *
 * @kind component
 * @returns A [`<Transition>`](/ui/Transition) element configured with the horizontal slide classes.
 * @example <HorizontalTransition>{currentStep}</HorizontalTransition>
 * @see https://dhoulb.github.io/shelving/ui/transition/HorizontalTransition/HorizontalTransition
 */
export function HorizontalTransition(props: HorizontalTransitionProps): ReactElement {
	return <Transition default="slideRight" forward="slideRight" back="slideLeft" {...props} />;
}
