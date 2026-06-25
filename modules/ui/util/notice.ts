import type { ReactNode } from "react";
import { isAsync } from "../../util/async.js";
import { getMessage } from "../../util/error.js";
import type { Arguments } from "../../util/function.js";
import type { Status } from "../style/Status.js";

// Constants.
const NOTICE_EVENT = "notice";

/** MessageEvent  */
class NoticeEvent extends CustomEvent<{ message: ReactNode; status: Status | undefined }> {}

/**
 * Notify the user with a message by dispatching a `notice` event.
 *
 * - This is how e.g. `<Button>` and `<FormNotify>` components send notices to the `<Notices>` list of global notices.
 * - The event bubbles, so any ancestor subscribed with `subscribeNotices()` will receive it.
 *
 * @param message The message to show, as a React node.
 * @param status Optional status (`"success"`, `"error"`, etc.) controlling how the notice is styled.
 * @param el Element to dispatch the event on (defaults to `window`).
 * @see https://shelving.cc/ui/notify
 */
export function notify(message: ReactNode, status?: Status | undefined, el: EventTarget = window): void {
	el.dispatchEvent(
		new NoticeEvent(NOTICE_EVENT, {
			detail: { message, status },
			bubbles: true,
		}),
	);
}

/**
 * Notify the user with a success message by dispatching a `notice` event with `"success"` status.
 *
 * @param message The success message to show, as a React node.
 * @param el Element to dispatch the event on (defaults to `window`).
 * @see https://shelving.cc/ui/notifySuccess
 */
export function notifySuccess(message: ReactNode, el?: EventTarget) {
	notify(message, "success", el);
}

/**
 * Notify the user with an error message by dispatching a `notice` event with `"error"` status.
 *
 * @param message The error message to show, as a React node.
 * @param el Element to dispatch the event on (defaults to `window`).
 * @see https://shelving.cc/ui/notifyError
 */
export function notifyError(message: ReactNode, el?: EventTarget) {
	notify(message, "error", el);
}

/**
 * Look at a thrown value, extract a viable message from it, and dispatch an error notice.
 *
 * - Uses `getMessage()` to pull a human-readable string from the thrown value.
 * - Falls back to a generic `"Unknown error"` notice and `console.error()` when no message can be extracted.
 *
 * @param thrown The thrown value to report.
 * @param el Element to dispatch the event on (defaults to `window`).
 * @see https://shelving.cc/ui/notifyThrown
 */
export function notifyThrown(thrown: unknown, el?: EventTarget) {
	const message = getMessage(thrown);
	if (message) {
		notifyError(message, el);
	} else {
		notifyError("Unknown error", el);
		console.error(thrown);
	}
}

/**
 * Subscribe to `notice` events on an element and call a callback when they happen.
 *
 * - Stops propagation so the notice is not handled again by a higher subscriber.
 *
 * @param callback Called with the message and status each time a notice event fires.
 * @param el Element to subscribe on (defaults to `window`).
 * @returns An unsubscribe function that removes the listener.
 * @see https://shelving.cc/ui/subscribeNotices
 */
export function subscribeNotices(
	callback: (message: ReactNode, status?: Status | undefined) => void,
	el: EventTarget = window,
): () => void {
	const listener = (e: Event) => {
		e.stopPropagation(); // Prevent bubbling to a higher notice subscriber.
		if (e instanceof NoticeEvent) callback(e.detail.message, e.detail.status);
	};
	el.addEventListener(NOTICE_EVENT, listener);
	return () => el.removeEventListener(NOTICE_EVENT, listener);
}

/**
 * Callback that can return or throw a value, triggering a success or error notice accordingly.
 *
 * @see https://shelving.cc/ui/NoticeCallback
 */
export type NoticeCallback<A extends Arguments> = (...args: A) => PromiseLike<ReactNode | undefined | void> | ReactNode | undefined | void;

/**
 * Run a callback and dispatch a success or error notice to the window based on its return or throw.
 *
 * - A returned truthy value becomes a `"success"` notice; a thrown value becomes an `"error"` notice via `notifyThrown()`.
 * - Resolves asynchronously when the callback returns a promise.
 *
 * @param callback The callback to run, whose return/throw drives the notice.
 * @param args Arguments forwarded to the callback.
 * @returns `true` if the callback succeeded, `false` if it threw (a `Promise` of the same when async).
 * @see https://shelving.cc/ui/callNotified
 */
export function callNotified<A extends Arguments>(callback: NoticeCallback<A>, ...args: A): boolean | Promise<boolean> {
	return callNotifiedElement(window, callback, ...args);
}

/**
 * Await a pending value and dispatch a success or error notice to the window based on its resolution.
 *
 * - A resolved truthy value becomes a `"success"` notice; a rejection becomes an `"error"` notice via `notifyThrown()`.
 *
 * @param pending The promise-like value to await.
 * @returns `true` if the value resolved, `false` if it rejected.
 * @see https://shelving.cc/ui/awaitNotified
 */
export function awaitNotified(pending: PromiseLike<ReactNode | undefined | void>): Promise<boolean> {
	return awaitNotifiedElement(window, pending);
}

/**
 * Run a callback and dispatch a success or error notice to a specific element based on its return or throw.
 *
 * - A returned truthy value becomes a `"success"` notice; a thrown value becomes an `"error"` notice via `notifyThrown()`.
 * - Resolves asynchronously when the callback returns a promise.
 *
 * @param el Element to dispatch the notice event on (defaults to `window` when `undefined`).
 * @param callback The callback to run, whose return/throw drives the notice.
 * @param args Arguments forwarded to the callback.
 * @returns `true` if the callback succeeded, `false` if it threw (a `Promise` of the same when async).
 * @example callNotifiedElement(formEl, () => save());
 * @see https://shelving.cc/ui/callNotifiedElement
 */
export function callNotifiedElement<A extends Arguments>(
	el: EventTarget | undefined,
	callback: NoticeCallback<A>,
	...args: A
): boolean | Promise<boolean> {
	try {
		const result = callback(...args);
		if (isAsync(result)) return awaitNotifiedElement(el, result);
		if (result) notifySuccess(result, el);
		return true;
	} catch (thrown) {
		notifyThrown(thrown, el);
		return false;
	}
}

/**
 * Await a pending value and dispatch a success or error notice to a specific element based on its resolution.
 *
 * - A resolved truthy value becomes a `"success"` notice; a rejection becomes an `"error"` notice via `notifyThrown()`.
 *
 * @param el Element to dispatch the notice event on (defaults to `window` when `undefined`).
 * @param pending The promise-like value to await.
 * @returns `true` if the value resolved, `false` if it rejected.
 * @example await awaitNotifiedElement(formEl, save());
 * @see https://shelving.cc/ui/awaitNotifiedElement
 */
export async function awaitNotifiedElement(
	el: EventTarget | undefined,
	pending: PromiseLike<ReactNode | undefined | void>,
): Promise<boolean> {
	try {
		const result = await pending;
		if (result) notifySuccess(result, el);
		return true;
	} catch (thrown) {
		notifyThrown(thrown, el);
		return false;
	}
}
