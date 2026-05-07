import type { ReactElement } from "react";
import "./VerticalTransition.css";
import { Transition, type TransitionProps } from "./Transition.js";

export interface VerticalTransitionProps extends TransitionProps {}

export function VerticalTransition(props: VerticalTransitionProps): ReactElement {
	return <Transition default="slideDown" forward="slideDown" back="slideUp" {...props} />;
}
