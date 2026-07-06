import type { ReactElement } from "react";
import "./VerticalTransition.css";
import { Transition, type TransitionProps } from "./Transition.js";

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
	return <Transition default="slide-down" forward="slide-down" back="slide-up" {...props} />;
}
