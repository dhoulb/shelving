import { getFirstFocusable } from "../../util/focus.js";
import type { Nullish } from "../../util/null.js";

/**
 * Focus on the first focusable element inside an element.
 *
 * - No-op for nullish input or non-`HTMLElement` nodes, and when the element contains nothing focusable.
 *
 * @param el The container element to focus the first focusable descendant of.
 * @example focusFirstFocusable(dialogRef.current);
 * @see https://shelving.cc/ui/focusFirstFocusable
 */
export function focusFirstFocusable(el: Nullish<Element>): void {
	if (el instanceof HTMLElement) getFirstFocusable(el)?.focus();
}

/**
 * Loop focus inside an element so it can't escape — refocus the first focusable child when focus moves out.
 *
 * - When `nextTarget` falls outside `element`, focus is pulled back to the first focusable element inside it (a simple focus trap).
 *
 * @param element The container to keep focus within.
 * @param nextTarget The element focus is moving to.
 * @example loopFocus(dialog, document.activeElement);
 * @see https://shelving.cc/ui/loopFocus
 */
export function loopFocus(element: Nullish<Element>, nextTarget: Nullish<Element>): void {
	if (element && nextTarget && !element.contains(nextTarget)) focusFirstFocusable(element);
}

/**
 * Loop focus inside an element in response to a `blur` event — a ready-made `onBlur` handler that traps focus.
 *
 * - Pulls focus back to the first focusable child when it blurs outside the event's `currentTarget`.
 *
 * @param event The `blur` event, providing `currentTarget` (the container) and `relatedTarget` (the new focus target).
 * @example <div onBlur={eventLoopFocus}>…</div>
 * @see https://shelving.cc/ui/eventLoopFocus
 */
export function eventLoopFocus({ currentTarget, relatedTarget }: { currentTarget: Element; relatedTarget: Element | null }): void {
	loopFocus(currentTarget, relatedTarget);
}
