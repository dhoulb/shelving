import type { ReactElement } from "react";
import "./HorizontalTransition.css";
import { Transition, type TransitionProps } from "./Transition.js";

export interface HorizontalTransitionProps extends TransitionProps {}

export function HorizontalTransition(props: HorizontalTransitionProps): ReactElement {
	return <Transition default="slideRight" forward="slideRight" back="slideLeft" {...props} />;
}
