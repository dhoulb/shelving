import type { ReactElement } from "react";
import "./CollapseTransition.css";
import { Transition, type TransitionProps } from "./Transition.js";

/**
 * Props for the `CollapseTransition` component — the shared transition variant props.
 *
 * @see https://shelving.cc/ui/CollapseTransitionProps
 */
export interface CollapseTransitionProps extends TransitionProps {}

/**
 * Transition that collapses its children in and out by animating their size.
 *
 * @kind component
 * @see https://shelving.cc/ui/CollapseTransition
 */
export function CollapseTransition(props: CollapseTransitionProps): ReactElement {
	return <Transition default="collapse" {...props} />;
}
