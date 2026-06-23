/// <reference types="react/canary" />
import { addTransitionType } from "react";

/**
 * Map of view-transition types to their CSS class names in `{ type: className }` format.
 *
 * - Each key is a "transition type" set with the React `addTransitionType()` API inside a `startTransition()` callback, e.g. `"forward"`.
 * - Each value is a "transition class" that React sets on the element as its `view-transition-class: forward;` CSS property — should correspond to a `::view-transition-old(.slideForward)` rule.
 *
 * @see https://shelving.cc/ui/TransitionClasses
 */
export type TransitionClasses = {
	default: string;
	forward?: string;
	back?: string;
};

/**
 * Known view-transition type names that all transitions support — the keys of `TransitionClasses`.
 *
 * @see https://shelving.cc/ui/TransitionType
 */
export type TransitionType = keyof TransitionClasses;

/**
 * Type-safe passthrough for React's `addTransitionType()` that checks `type` is one of our known view-transition types.
 *
 * @param type The transition type to activate, constrained to a known `TransitionType`.
 * @example setTransitionType("forward")
 * @see https://shelving.cc/ui/setTransitionType
 */
export function setTransitionType(type: TransitionType): void {
	addTransitionType(type);
}
