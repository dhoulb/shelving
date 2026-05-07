import type { ReactElement } from "react";
import { Transition, type TransitionProps } from "./Transition.js";

export interface FadeTransitionProps extends TransitionProps {}

export function FadeTransition(props: FadeTransitionProps): ReactElement {
	return <Transition default="fade" {...props} />;
}
