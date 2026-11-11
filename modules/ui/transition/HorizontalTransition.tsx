import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import HORIZONTAL_TRANSITION_CSS from "./HorizontalTransition.module.css";
import { Transition, type TransitionProps } from "./Transition.js";

const HORIZONTAL_TRANSITION_FORWARD_CLASS = getModuleClass(HORIZONTAL_TRANSITION_CSS, "slide-right");
const HORIZONTAL_TRANSITION_BACK_CLASS = getModuleClass(HORIZONTAL_TRANSITION_CSS, "slide-left");

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
			default={HORIZONTAL_TRANSITION_FORWARD_CLASS}
			forward={HORIZONTAL_TRANSITION_FORWARD_CLASS}
			back={HORIZONTAL_TRANSITION_BACK_CLASS}
			{...props}
		/>
	);
}
