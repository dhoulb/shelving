/** Selector for elements that can take focus */
const FOCUSABLE = `a:link, button:enabled, input:enabled, select:enabled, textarea:enabled, [tabindex]:not([tabindex="-1"]):not(:disabled)`;

/**
 * Find the first focusable element inside an HTML element (including the element itself).
 * - An element is focusable if it's an enabled link, button, input, select, or textarea, or has a non-negative `tabindex`.
 *
 * @param el The HTML element to search (it is tested first, then its descendants).
 * @returns The first focusable `HTMLElement`, or `null` if none is found.
 * @example getFirstFocusable(form) // the first enabled input inside the form
 * @see https://shelving.cc/util/focus/getFirstFocusable
 */
export function getFirstFocusable(el: HTMLElement): HTMLElement | null {
	return el.matches(FOCUSABLE) ? el : el.querySelector(FOCUSABLE);
}
