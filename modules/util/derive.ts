import type { Resolvable } from "./data.js";
import { handle, Handler, logError } from "./error.js";
import { SKIP } from "./constants.js";
import { isAsync } from "./promise.js";
import { AsyncDispatcher, dispatch, thispatch } from "./dispatch.js";

/** Function that takes an input value and returns a value derived from it. */
export type Deriver<T = unknown, TT = unknown> = (input: T) => TT;

/** Function that takes an input value and returns a value derived from it (possibly promised). */
export type AsyncDeriver<T = unknown, TT = unknown> = (input: T) => TT;

/**
 * Derive a value using a `Deriver` or `AsyncDeriver` function, then dispatch it to a `Dispatcher` or `AsyncDispatcher` function safely.
 * - Returning the `SKIP` constant from a `Deriver` should skip that value.
 *
 * @param handler Handler that handles any thrown errors.
 */
export function derive<I, O>(value: Resolvable<I>, deriver: AsyncDeriver<I, Resolvable<O>>, dispatcher: AsyncDispatcher<O>, handler: Handler = logError): void {
	if (isAsync(value)) return void _deriveAsync(value, deriver, dispatcher, handler);
	try {
		if (value !== SKIP) dispatch<O>(dispatcher, deriver(value), handler);
	} catch (thrown) {
		handle(handler, thrown);
	}
}
async function _deriveAsync<I, O>(
	value: Promise<I | typeof SKIP>,
	deriver: AsyncDeriver<I, Resolvable<O>>,
	dispatcher: AsyncDispatcher<O>,
	handler: Handler,
): Promise<void> {
	try {
		const awaited = await value;
		if (awaited !== SKIP) dispatch<O>(dispatcher, deriver(awaited), handler);
	} catch (thrown) {
		handle(handler, thrown);
	}
}

/**
 * Derive a value using a `Deriver` or `AsyncDeriver` function, then dispatch it to a `Dispatcher` or `AsyncDispatcher` method on an object safely.
 *
 * @param handler Handler that handles any thrown errors.
 */
export function therive<I, O, M extends string | symbol>(
	value: Resolvable<I>,
	deriver: AsyncDeriver<I, O>,
	obj: { [K in M]?: AsyncDispatcher<O> },
	key: M,
	handler: Handler = logError,
): void {
	if (isAsync(value)) return void _theriveAsync(value, deriver, obj, key, handler);
	try {
		if (value !== SKIP) thispatch(obj, key, deriver(value), handler);
	} catch (thrown) {
		handle(handler, thrown);
	}
}
async function _theriveAsync<I, O, M extends string | symbol>(
	value: Resolvable<I>,
	deriver: AsyncDeriver<I, O>,
	obj: { [K in M]?: AsyncDispatcher<O> },
	key: M,
	handler: Handler,
): Promise<void> {
	try {
		const awaited = await value;
		if (awaited !== SKIP) thispatch(obj, key, deriver(awaited), handler);
	} catch (thrown) {
		handle(handler, thrown);
	}
}
