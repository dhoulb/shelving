import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import { Transition, type TransitionProps } from "./Transition.js";
import VERTICAL_TRANSITION_CSS from "./VerticalTransition.module.css";

const VERTICAL_TRANSITION_FORWARD_CLASS = getModuleClass(VERTICAL_TRANSITION_CSS, "slide-down");
const VERTICAL_TRANSITION_BACK_CLASS = getModuleClass(VERTICAL_TRANSITION_CSS, "slide-up");

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
		<Transition
			default={VERTICAL_TRANSITION_FORWARD_CLASS}
			forward={VERTICAL_TRANSITION_FORWARD_CLASS}
			back={VERTICAL_TRANSITION_BACK_CLASS}
			{...props}
		/>
	);
}
