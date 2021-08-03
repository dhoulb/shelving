import type { Resolvable } from "./data";
import { logError } from "./console";
import { SKIP } from "./constants";
import { isAsync } from "./promise";

/** Catcher: function that receives a thrown error. */
export type Catcher = (reason: Error | unknown) => void;

/** `Catcher` that receives a thrown error and might return `Promise` */
export type AsyncCatcher = (reason: Error | unknown) => void | Promise<void>;

/** Wait for a value to resolve and if it throws call a catcher. */
async function _catch<T, C extends string>(promised: Promise<T>, catcher?: Catcher | { [K in C]?: Catcher }, method?: C) {
	try {
		await promised;
	} catch (thrown) {
		_caught(thrown, catcher, method);
	}
}

/** Dispatch a thrown value to a catcher. */
function _caught<C extends string>(thrown: Error | unknown, catcher?: Catcher | { [K in C]?: Catcher }, method?: C) {
	if (typeof catcher === "function") catcher(thrown);
	else if (catcher && typeof method === "string" && typeof catcher[method] === "function") (catcher[method] as Catcher)(thrown);
	else logError(thrown);
}

/**
 * Dispatcher: a function that dispatches a value.
 * - We never care about the returned value of a dispatcher.
 * - Consistent with: `Dispatcher`, `Deriver`, `Ranker`, `Comparer`, `Matcher`
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

/**
 * Dispatch: dispatch a value to a `Dispatcher` or `AsyncDispatcher` function safely.
 *
 * @param dispatcher Any dispatcher function.
 * - Any errors thrown or rejected by the dispatcher are caught and routed to the catcher.
 * @param value The value to dispatch into the dispatcher function.
 * - Resolvable, so `Promise` values will be awaited and the `SKIP` constant can be used to skip dispatching.
 * @param catcherObj Catcher callback that any thrown or rejected errors are dispatched to.
 * - Can be either a single callback function, or an object that contains a method to catch errors.
 * @param catcherKey Catcher method name in `catcherObj`
 */
// Empty dispatchers.
export function dispatch(dispatcher: AsyncEmptyDispatcher, value?: undefined, catcherObj?: Catcher): void;
export function dispatch<C extends string>(dispatcher: AsyncEmptyDispatcher, value: undefined, catcherObj: { [K in C]?: Catcher }, catcherKey: C): void;
// Typed dispatchers.
export function dispatch<T>(dispatcher: AsyncDispatcher<T>, value: Resolvable<T>, catcherObj?: Catcher): void;
export function dispatch<T, C extends string>(dispatcher: AsyncDispatcher<T>, value: Resolvable<T>, catcherObj: { [K in C]?: Catcher }, catcherKey: C): void;
// Overrides for unknown dispatchers.
export function dispatch(dispatcher: AsyncDispatcher<unknown>, value: unknown, catcherObj?: Catcher): void;
export function dispatch<C extends string>(dispatcher: AsyncDispatcher<unknown>, value: unknown, catcherObj: { [K in C]?: Catcher }, catcherKey: C): void;
// Flexible override.
export function dispatch<T, C extends string>(
	dispatcher: AsyncDispatcher<T>,
	value: Resolvable<T>,
	catcherObj?: Catcher | { [K in C]?: Catcher },
	catcherKey?: C,
): void;
// Definition.
export function dispatch<T, C extends string>(
	dispatcher: AsyncDispatcher<T>,
	value: Resolvable<T>,
	catcherObj?: Catcher | { [K in C]?: Catcher },
	catcherKey?: C,
): void {
	if (isAsync(value)) return void _dispatchAsync(dispatcher, value, catcherObj);
	try {
		if (value !== SKIP) {
			const returned = dispatcher(value);
			if (isAsync(returned)) void _catch(returned, catcherObj, catcherKey);
		}
	} catch (thrown: unknown) {
		_caught(thrown, catcherObj, catcherKey);
	}
}
async function _dispatchAsync<T, C extends string>(
	dispatcher: AsyncDispatcher<T>,
	value: Promise<T | typeof SKIP>,
	catcherObj?: Catcher | { [K in C]?: Catcher },
	catcherKey?: C,
): Promise<void> {
	try {
		const awaited = await value;
		if (awaited !== SKIP) await dispatcher(awaited);
	} catch (thrown) {
		_caught(thrown, catcherObj, catcherKey);
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
 * @param catcherObj Catcher callback that any thrown or rejected errors are dispatched to.
 * - Can be either a single callback function, or an object that contains a method to catch errors.
 * @param catcherKey Catcher method name in `catcherObj`
 */
// Empty dispatchers.
export function thispatch<M extends string>(obj: { [K in M]?: AsyncEmptyDispatcher }, key: M, value?: undefined, catcherObj?: Catcher): void;
export function thispatch<M extends string, C extends string>(
	obj: { [K in M]?: AsyncEmptyDispatcher },
	key: M,
	value: undefined,
	catcherObj: { [K in C]?: Catcher },
	catcherKey: C,
): void;
// Typed dispatchers.
export function thispatch<T, M extends string>(obj: { [K in M]?: AsyncDispatcher<T> }, key: M, value: Resolvable<T>, catcherObj?: Catcher): void;
export function thispatch<T, M extends string, C extends string>(
	obj: { [K in M]?: AsyncDispatcher<T> },
	key: M,
	value: Resolvable<T>,
	catcherObj: { [K in C]?: Catcher },
	catcherKey: C,
): void;
// Overrides for unknown dispatchers.
export function thispatch<M extends string>(obj: { [K in M]?: AsyncDispatcher<unknown> }, key: M, value: unknown, catcherObj?: Catcher): void;
export function thispatch<M extends string, C extends string>(
	obj: { [K in M]?: AsyncDispatcher<unknown> },
	key: M,
	value: unknown,
	catcherObj: { [K in C]?: Catcher },
	catcherKey: C,
): void;
// Flexible override.
export function thispatch<T, M extends string, C extends string>(
	obj: { [K in M]?: AsyncDispatcher<T> },
	key: M,
	value: Resolvable<T>,
	catcherObj?: Catcher | { [K in C]?: Catcher },
	catcherKey?: C,
): void;
// Definition.
export function thispatch<T, M extends string, C extends string>(
	obj: { [K in M]?: AsyncDispatcher<T> },
	key: M,
	value: Resolvable<T>,
	catcherObj?: Catcher | { [K in C]?: Catcher },
	catcherKey?: C,
): void {
	if (isAsync(value)) return void _thispatchAsync(obj, key, value, catcherObj);
	try {
		if (value !== SKIP) {
			const returned = obj[key]?.(value);
			if (isAsync(returned)) void _catch(returned, catcherObj, catcherKey);
		}
	} catch (thrown: unknown) {
		void _caught(thrown, catcherObj, catcherKey);
	}
}
async function _thispatchAsync<T, M extends string, C extends string>(
	obj: { [K in M]?: AsyncDispatcher<T> },
	method: M,
	value: Promise<T | typeof SKIP>,
	catcherObj?: Catcher | { [K in C]?: Catcher },
	catcherKey?: C,
): Promise<void> {
	try {
		const awaited = await value;
		if (awaited !== SKIP) await obj[method]?.(awaited);
	} catch (thrown) {
		void _caught(thrown, catcherObj, catcherKey);
	}
}

/**
 * Deriver: a function that takes an input value and returns a value derived from it.
 * - Consistent with: `Dispatcher`, `Deriver`, `Searcher`, `Comparer`, `Matcher`
 * - Returning the `SKIP` constant from a `Deriver` should skip that value.
 */
export type Deriver<T = unknown, TT = unknown> = (input: T) => TT | typeof SKIP;

/** `Deriver` that might return a promise */
export type AsyncDeriver<T = unknown, TT = unknown> = (input: T) => TT | typeof SKIP | Promise<TT | typeof SKIP>;

/**
 * Derive: derive a value using a `Deriver` or `AsyncDeriver` function, then dispatch it to a `Dispatcher` or `AsyncDispatcher` function safely.
 */
// Typed derivers.
export function derive<I, O>(value: Resolvable<I>, deriver: AsyncDeriver<I, O>, dispatcher: AsyncDispatcher<O>, catcherObj?: Catcher): void;
export function derive<I, O, C extends string>(
	value: Resolvable<I>,
	deriver: AsyncDeriver<I, O>,
	dispatcher: AsyncDispatcher<O>,
	catcherObj: { [K in C]?: Catcher },
	catcherKey: C,
): void;
// Overrides for unknown dispatchers.
// export function derive(value: unknown, deriver: AsyncDeriver<unknown, unknown>, dispatcher: AsyncDispatcher<unknown>, catcherObj?: Catcher): void;
// export function derive<C extends string>(
// 	value: unknown,
// 	deriver: AsyncDeriver<unknown, unknown>,
// 	dispatcher: AsyncDispatcher<unknown>,
// 	catcherObj: { [K in C]?: Catcher },
// 	catcherKey: C,
// ): void;
// Flexible override.
export function derive<I, O, C extends string>(
	value: Resolvable<I>,
	deriver: AsyncDeriver<I, O>,
	dispatcher: AsyncDispatcher<O>,
	catcherObj?: Catcher | { [K in C]?: Catcher },
	catcherKey?: C,
): void;
// Definition.
export function derive<I, O, C extends string>(
	value: Resolvable<I>,
	deriver: AsyncDeriver<I, O>,
	dispatcher: AsyncDispatcher<O>,
	catcherObj?: Catcher | { [K in C]?: Catcher },
	catcherKey?: C,
): void {
	if (isAsync(value)) return void _deriveAsync(value, deriver, dispatcher, catcherObj, catcherKey);
	try {
		if (value !== SKIP) dispatch(dispatcher, deriver(value), catcherObj, catcherKey);
	} catch (thrown: unknown) {
		void _caught(thrown, catcherObj, catcherKey);
	}
}
async function _deriveAsync<I, O, C extends string>(
	value: Promise<I | typeof SKIP>,
	deriver: AsyncDeriver<I, O>,
	dispatcher: AsyncDispatcher<O>,
	catcherObj?: Catcher | { [K in C]?: Catcher },
	catcherKey?: C,
): Promise<void> {
	try {
		const awaited = await value;
		if (awaited !== SKIP) dispatch(dispatcher, deriver(awaited), catcherObj, catcherKey);
	} catch (thrown) {
		void _caught(thrown, catcherObj, catcherKey);
	}
}

/**
 * Method derive: derive a value using a `Deriver` or `AsyncDeriver` function, then dispatch it to a `Dispatcher` or `AsyncDispatcher` method on an object safely.
 */
// Typed derivers.
export function therive<I, O, M extends string>(
	value: Resolvable<I>,
	deriver: AsyncDeriver<I, O>,
	obj: { [K in M]?: AsyncDispatcher<O> },
	key: M,
	catcherObj?: Catcher,
): void;
export function therive<I, O, M extends string, C extends string>(
	value: Resolvable<I>,
	deriver: AsyncDeriver<I, O>,
	obj: { [K in M]?: AsyncDispatcher<O> },
	key: M,
	catcherObj: { [K in C]?: Catcher },
	catcherKey: C,
): void;
// Overrides for unknown dispatchers.
export function therive<M extends string>(
	value: unknown,
	deriver: AsyncDeriver<unknown, unknown>,
	obj: { [K in M]?: AsyncDispatcher<unknown> },
	key: M,
	catcherObj?: Catcher,
): void;
export function therive<M extends string, C extends string>(
	value: unknown,
	deriver: AsyncDeriver<unknown, unknown>,
	obj: { [K in M]?: AsyncDispatcher<unknown> },
	key: M,
	catcherObj: { [K in C]?: Catcher },
	catcherKey: C,
): void;
// Flexible override.
export function therive<I, O, M extends string, C extends string>(
	value: Resolvable<I>,
	deriver: AsyncDeriver<I, O>,
	obj: { [K in M]?: AsyncDispatcher<O> },
	key: M,
	catcherObj?: Catcher | { [K in C]?: Catcher },
	catcherKey?: C,
): void;
// Definition.
export function therive<I, O, M extends string, C extends string>(
	value: Resolvable<I>,
	deriver: AsyncDeriver<I, O>,
	obj: { [K in M]?: AsyncDispatcher<O> },
	key: M,
	catcherObj?: Catcher | { [K in C]?: Catcher },
	catcherKey?: C,
): void {
	if (isAsync(value)) return void _theriveAsync(value, deriver, obj, key, catcherObj, catcherKey);
	try {
		if (value !== SKIP) thispatch(obj, key, deriver(value), catcherObj, catcherKey);
	} catch (thrown: unknown) {
		void _caught(thrown, catcherObj, catcherKey);
	}
}
async function _theriveAsync<I, O, M extends string, C extends string>(
	value: Resolvable<I>,
	deriver: AsyncDeriver<I, O>,
	obj: { [K in M]?: AsyncDispatcher<O> },
	key: M,
	catcherObj?: Catcher | { [K in C]?: Catcher },
	catcherKey?: C,
): Promise<void> {
	try {
		const awaited = await value;
		if (awaited !== SKIP) thispatch(obj, key, deriver(awaited), catcherObj, catcherKey);
	} catch (thrown) {
		void _caught(thrown, catcherObj, catcherKey);
	}
}
