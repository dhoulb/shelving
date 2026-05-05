import { getFirstFocusable, type Nullish } from "shelving";

/** Focus on the first focusable element inside an element. */
export function focusFirstFocusable(el: Nullish<Element>): void {
	if (el instanceof HTMLElement) getFirstFocusable(el)?.focus();
}

/**
 * Loop focus inside an element.
 * - Attempts to blur outside the `from` element refocus back on the first focusable element inside the element.
 */
export function loopFocus(element: Nullish<Element>, nextTarget: Nullish<Element>): void {
	if (element && nextTarget && !element.contains(nextTarget)) focusFirstFocusable(element);
}

/**
 * Loop focus inside an element in response to a `blur` event.
 * - Attempts to blur outside the `currentTarget` element refocus back on the first focusable element inside the element.
 */
export function eventLoopFocus({ currentTarget, relatedTarget }: { currentTarget: Element; relatedTarget: Element | null }): void {
	loopFocus(currentTarget, relatedTarget);
}
