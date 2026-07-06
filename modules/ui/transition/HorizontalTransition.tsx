import type { ReactElement } from "react";
import "./HorizontalTransition.css";
import { Transition, type TransitionProps } from "./Transition.js";

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
	return <Transition default="slide-right" forward="slide-right" back="slide-left" {...props} />;
}
