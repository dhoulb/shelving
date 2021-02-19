/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ImmutableObject } from "../object";
import { logError } from "../console";

/**
 * Dispatcher: a function that dispatches a value.
 * - We never care about the returned value of a dispatcher.
 * - Consistent with: `Dispatcher`, `Deriver`, `Filterer`, `Comparer`, `Matcher`
 */
export type Dispatcher<T> = (value: T) => void;

/** `Dispatcher` that dispatches nothing. */
export type EmptyDispatcher = () => void;

/** `Dispatcher` that might return `Promise` */
export type AsyncDispatcher<T> = (value: T) => void | Promise<void>;

/** `Dispatcher` that dispatches nothing and might return `Promise` */
export type AsyncEmptyDispatcher = () => void | Promise<void>;

/** `Dispatcher` that unsubscribes a subscription. */
export type Unsubscriber = () => void;

/** `Dispatcher` that dispatches an error. */
export type Catcher = (reason: Error | unknown) => void;

/** `Dispatcher` that dispatches an error and might return `Promise` */
export type AsyncCatcher = (reason: Error | unknown) => void | Promise<void>;

/**
 * Dispatch: call a dispatcher function safely.
 *
 * @param dispatcher Any dispatcher function.
 * - Any errors thrown or rejected by the dispatcher are caught and routed to the catcher.
 * @param value The value to dispatch into the dispatcher function.
 * @param catcher The catcher callback function that any thrown or rejected errors are dispatched to.
 */
export function dispatch<I = void>(dispatcher: AsyncDispatcher<I>, value: Promise<I> | I, catcher = logError): void {
	if (value instanceof Promise) {
		void _dispatchAsync(dispatcher, value, catcher);
	} else {
		try {
			const returned = dispatcher(value);
			if (returned instanceof Promise) returned.catch(logError);
		} catch (thrown: unknown) {
			catcher(thrown);
		}
	}
}
async function _dispatchAsync<I>(dispatcher: AsyncDispatcher<I>, value: Promise<I>, catcher: Catcher) {
	try {
		await dispatcher(await value);
	} catch (thrown: unknown) {
		catcher(thrown);
	}
}

/**
 * Thispatch: call a dispatcher method safely.
 * - Name is a combination of `dispatch` and `this`.
 * - Yes it's weird but it's a one-word name and life's short.
 */
export function thispatch<I = void>(that: ImmutableObject<any>, dispatcher: AsyncDispatcher<I>, value: Promise<I> | I, catcher = logError): void {
	if (value instanceof Promise) {
		void _thispatchAsync(that, dispatcher, value, catcher);
	} else {
		try {
			const returned = dispatcher.call(that, value);
			if (returned instanceof Promise) returned.catch(logError);
		} catch (thrown: unknown) {
			catcher(thrown);
		}
	}
}
async function _thispatchAsync<I>(that: ImmutableObject<any>, dispatcher: AsyncDispatcher<I>, value: Promise<I>, catcher: Catcher): Promise<void> {
	try {
		const returned = dispatcher.call(that, await value);
		if (returned instanceof Promise) returned.catch(logError);
	} catch (thrown: unknown) {
		catcher(thrown);
	}
}
