import type { ReactElement } from "react";
import "./CollapseTransition.css";
import { Transition, type TransitionProps } from "./Transition.js";

/**
 * Props for the `CollapseTransition` component — the shared transition variant props.
 *
 * @see https://dhoulb.github.io/shelving/ui/transition/CollapseTransition/CollapseTransitionProps
 */
export interface CollapseTransitionProps extends TransitionProps {}

/**
 * Transition that collapses its children in and out by animating their size.
 *
 * @kind component
 * @returns A [`<Transition>`](/ui/Transition) element configured with the `collapse` class.
 * @example <CollapseTransition>{visible && <Panel />}</CollapseTransition>
 * @see https://dhoulb.github.io/shelving/ui/transition/CollapseTransition/CollapseTransition
 */
export function CollapseTransition(props: CollapseTransitionProps): ReactElement {
	return <Transition default="collapse" {...props} />;
}
