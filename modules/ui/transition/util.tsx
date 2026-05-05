import { addTransitionType } from "react";

/**
 * List of known view transitions in `{ type: className }` format.
 *
 * @param type A "transition type" set with the React `addTransitionType()` API inside a `startTransition()` callback, e.g. "forward"
 *
 * @param class A "transition class" that gets set by React on the element as its `view-transition-class: forward;` CSS property.
 * - Should correspond to a `::view-transition-old(.slideForward)`
 */
export type TransitionClasses = {
	default: string;
	forward?: string;
	back?: string;
};

/** List of known view transition types all of view transitions support. */
export type TransitionType = keyof TransitionClasses;

/** Type-safe passthrough for the React `addTransitionType()` that checks `type` is one of our known view transition types. */
export function setTransitionType(type: TransitionType): void {
	addTransitionType(type);
}
