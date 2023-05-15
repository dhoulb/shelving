import type { MutableArray } from "../util/array.js";
import { useEffect, useRef } from "react";
import { addArrayItem, deleteArrayItems, getLastItem } from "../util/array.js";

/** Stack of elements that should be keeping focus. */
let FOCUSED: MutableArray<HTMLElement>;

/** Selector for elements that can take focus */
const FOCUSABLE = `[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])`;

/**
 * Focus on the first focusable element inside a container.
 * - Checks items with an `autofocus` attribute first, then other elements.
 */
function _applyFocus(container: HTMLElement, selector = FOCUSABLE) {
	if (container.matches(selector)) return container.focus();
	const child = container.querySelector(selector);
	if (child instanceof HTMLElement) return child.focus();
}

/**
 * Hook that puts the user's focus on an element (or the first focusable element inside that element) when it is attached to the DOM.
 * - When the element using `useFocus()` is attached to the DOM, finds the first focusable element and calls `element.focus()` on it.
 * - If the user tabs outside the element focus will 'wrap' and refocus inside the container until the targeted element is detached from the DOM.
 *
 * @param active Whether this `useFocus()` is active or not (so we can skip setting focus for modals that appear in the DOM but are minimised etc).
 *
 * @returns React ref that should be set on the target element you want the focus to be placed on or within.
 */
export function useFocus<T extends HTMLElement>(active = true): React.RefObject<T> {
	// Store the element in a ref.
	const ref = useRef<T>(null);

	// Effect that runs when element is first attached to the DOM.
	useEffect(() => {
		// Set up a global listener the first time `useFocus()` is actually used.
		if (!FOCUSED) {
			FOCUSED = [];

			// Add a focus listener on the body that listens for changes in focus.
			document.body.addEventListener("focusin", () => {
				const el = getLastItem(FOCUSED);
				if (el && !el.contains(document.activeElement)) _applyFocus(el);
			});
		}

		// Only run if the element is open and the ref is attached.
		const el = ref.current;
		if (active && el) {
			// Keep reference to the element that was focused before this element took the focus.
			const lastEl = document.activeElement;

			// Focus immediately on the first auto-focusable element now (e.g. this might just be the close button).
			_applyFocus(el, FOCUSABLE);

			// Add this element to the stack of elements to keep focused.
			addArrayItem(FOCUSED, el);

			return () => {
				// Remove this element from the stack of elements to keep focused.
				deleteArrayItems(FOCUSED, el);

				// Attempt to restore the previous focus.
				if (lastEl instanceof HTMLElement) lastEl.focus();
			};
		}
	}, [ref.current, active]);

	return ref;
}
