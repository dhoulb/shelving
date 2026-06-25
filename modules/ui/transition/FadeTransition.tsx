import type { ReactElement } from "react";
import { Transition, type TransitionProps } from "./Transition.js";

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
	return <Transition default="fade" {...props} />;
}
