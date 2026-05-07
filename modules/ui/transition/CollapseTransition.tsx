import type { ReactElement } from "react";
import "./CollapseTransition.css";
import { Transition, type TransitionProps } from "./Transition.js";

export interface CollapseTransitionProps extends TransitionProps {}

export function CollapseTransition(props: CollapseTransitionProps): ReactElement {
	return <Transition default="collapse" {...props} />;
}
