import type { ReactElement } from "react";
import { Transition, type TransitionProps } from "./Transition.js";

/**
 * Props for the `FadeTransition` component — the shared transition variant props.
 *
 * @see https://dhoulb.github.io/shelving/ui/transition/FadeTransition/FadeTransitionProps
 */
export interface FadeTransitionProps extends TransitionProps {}

/**
 * Transition that fades its children in and out by animating their opacity.
 *
 * @kind component
 * @returns A [`<Transition>`](/ui/Transition) element configured with the `fade` class.
 * @example <FadeTransition>{visible && <Toast />}</FadeTransition>
 * @see https://dhoulb.github.io/shelving/ui/transition/FadeTransition/FadeTransition
 */
export function FadeTransition(props: FadeTransitionProps): ReactElement {
	return <Transition default="fade" {...props} />;
}
