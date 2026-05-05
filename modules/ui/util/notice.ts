import type { ReactNode } from "react";
import { type Arguments, getMessage, isAsync } from "shelving";
import type { Status } from "../notice/Status.js";

// Constants.
const NOTICE_EVENT = "notice";

/** MessageEvent  */
class NoticeEvent extends CustomEvent<{ message: ReactNode; status: Status | undefined }> {}

/**
 * Notify the user with a message by dispatching a notice event.
 * - This is how e.g. `<Button>` and `<FormNotify>` components send notices to the `<Notices>` list of global notices.
 */
export function notify(message: ReactNode, status?: Status | undefined, el: EventTarget = window): void {
	el.dispatchEvent(
		new NoticeEvent(NOTICE_EVENT, {
			detail: { message, status },
			bubbles: true,
		}),
	);
}

/** Notify the user with a success message by dispatching a notice event. */
export function notifySuccess(message: ReactNode, el?: EventTarget) {
	notify(message, "success", el);
}

/** Notify the user with a success message by dispatching a notice event. */
export function notifyError(message: ReactNode, el?: EventTarget) {
	notify(message, "error", el);
}

/** Look at a thrown value, extract a viable message from it, and dispatch a notice event.. */
export function notifyThrown(thrown: unknown, el?: EventTarget) {
	const message = getMessage(thrown);
	if (message) {
		notifyError(message, el);
	} else {
		notifyError("Unknown error", el);
		console.error(thrown);
	}
}

/** Subscribe to notice events on the window and call a callback when they happen. */
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

/** Callback that can return or throw a string, which will trigger a success or error notice accordingly. */
export type NoticeCallback<A extends Arguments> = (...args: A) => PromiseLike<ReactNode | undefined | void> | ReactNode | undefined | void;

/** Callback that publishes notices to the window if it returns or throws "string" */
export function callNotified<A extends Arguments>(callback: NoticeCallback<A>, ...args: A): boolean | Promise<boolean> {
	return callNotifiedElement(window, callback, ...args);
}

/** Await a value that publishes "success" or "error" notices to the window if it returns */
export function awaitNotified(pending: PromiseLike<ReactNode | undefined | void>): Promise<boolean> {
	return awaitNotifiedElement(window, pending);
}

/** Callback that publishes notices to an element (defaults to the window) if it returns or throws "string" */
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

/** Await a value that publishes "success" or "error" notices to an element (defaults to the window) if it returns */
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
