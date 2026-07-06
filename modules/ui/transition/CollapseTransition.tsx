import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import COLLAPSE_CSS from "./CollapseTransition.module.css";
import { Transition, type TransitionProps } from "./Transition.js";

const COLLAPSE_CLASS = getModuleClass(COLLAPSE_CSS, "collapse");

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
	return <Transition default={COLLAPSE_CLASS} {...props} />;
}
