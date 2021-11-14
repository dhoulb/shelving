import type { Resolvable } from "./data.js";
import { handle, Handler, logError } from "./error.js";
import { SKIP } from "./constants.js";
import { isAsync } from "./promise.js";

/** Wait for a value to resolve and if it throws call a catcher. */
async function _handleAsync<T>(promised: Promise<T>, handler: Handler = logError) {
	try {
		await promised;
	} catch (thrown) {
		handle(handler, thrown);
	}
}

/** Function that dispatches a value (we never care about the returned value). */
export type Dispatcher<T> = (value: T) => void;

/** `Dispatcher` that dispatches nothing. */
export type EmptyDispatcher = () => void;

/** `Dispatcher` that might return `Promise` */
export type AsyncDispatcher<T> = (value: T) => void | Promise<void>;

/** `Dispatcher` that dispatches nothing and might return `Promise` */
export type AsyncEmptyDispatcher = () => void | Promise<void>;

/**
 * Dispatch: dispatch a value to a `Dispatcher` or `AsyncDispatcher` function safely.
 *
 * @param dispatcher Any dispatcher function.
 * - Any errors thrown or rejected by the dispatcher are caught and routed to the catcher.
 * @param value The value to dispatch into the dispatcher function.
 * - Resolvable, so `Promise` values will be awaited and the `SKIP` constant can be used to skip dispatching.
 * @param handler Handler that handles any thrown errors.
 */
export function dispatch(dispatcher: AsyncEmptyDispatcher, value?: undefined, handler?: Handler): void;
export function dispatch<T>(dispatcher: AsyncDispatcher<T>, value: Resolvable<T>, handler?: Handler): void;
export function dispatch<T>(dispatcher: AsyncDispatcher<T>, value: Resolvable<T>, handler: Handler = logError): void {
	if (isAsync(value)) return void _dispatchAsync(dispatcher, value, handler);
	try {
		if (value !== SKIP) {
			const returned = dispatcher(value);
			if (isAsync(returned)) void _handleAsync(returned, handler);
		}
	} catch (thrown) {
		handle(handler, thrown);
	}
}
async function _dispatchAsync<T>(dispatcher: AsyncDispatcher<T>, value: Promise<T | typeof SKIP>, handler: Handler): Promise<void> {
	try {
		const awaited = await value;
		if (awaited !== SKIP) await dispatcher(awaited);
	} catch (thrown) {
		handle(handler, thrown);
	}
}

/**
 * Method dispatch: dispatch a value to a `Dispatcher` or `AsyncDispatcher` method on an object safely.
 *
 * @param obj The object containing the method.
 * @param key The key specifiying which method to call (if the method is not defined, nothing will be dispatched).
 * - Any errors thrown or rejected by the dispatcher are caught and routed to the catcher.
 * @param value The value to dispatch into the dispatcher method.
 * - Resolvable, so `Promise` values will be awaited and the `SKIP` constant can be used to skip dispatching.
 * @param handler Handler that handles any thrown errors.
 */
// Empty dispatchers.
export function thispatch<M extends string | symbol>(obj: { [K in M]?: AsyncEmptyDispatcher }, key: M, value?: undefined, handler?: Handler): void;
export function thispatch<T, M extends string | symbol>(obj: { [K in M]?: AsyncDispatcher<T> }, key: M, value: Resolvable<T>, handler?: Handler): void;
export function thispatch<T, M extends string | symbol>(
	obj: { [K in M]?: AsyncDispatcher<T> },
	key: M,
	value: Resolvable<T>,
	handler: Handler = logError,
): void {
	if (isAsync(value)) return void _thispatchAsync(obj, key, value, handler);
	try {
		if (value !== SKIP) {
			const returned = obj[key]?.(value);
			if (isAsync(returned)) void _handleAsync(returned, handler);
		}
	} catch (thrown) {
		handle(handler, thrown);
	}
}
async function _thispatchAsync<T, M extends string | symbol>(
	obj: { [K in M]?: AsyncDispatcher<T> },
	method: M,
	value: Promise<T | typeof SKIP>,
	handler: Handler,
): Promise<void> {
	try {
		const awaited = await value;
		if (awaited !== SKIP) await obj[method]?.(awaited);
	} catch (thrown) {
		handle(handler, thrown);
	}
}
