/** Selector for elements that can take focus */
const FOCUSABLE = `a:link, button:enabled, input:enabled, select:enabled, textarea:enabled, [tabindex]:not([tabindex="-1"]):not(:disabled)`;

/** Find the first focusable element inside HTML element (including the element itself). */
export function getFirstFocusable(el: HTMLElement): HTMLElement | null {
	return el.matches(FOCUSABLE) ? el : el.querySelector(FOCUSABLE);
}
