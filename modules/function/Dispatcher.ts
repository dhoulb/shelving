import type { Resolvable } from "../data";
import { logError } from "../console";
import { SKIP } from "../constants";

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
 * - Resolvable, so `Promise` values will be awaited and the `SKIP` constant can be used to skip dispatching.
 * @param catcherObj Catcher callback that any thrown or rejected errors are dispatched to.
 * - Can be either a single callback function, or an object that contains a method to catch errors.
 * @param catcherKey Catcher method name in `catcherObj`
 */
// Overrides for empty dispatchers.
export function dispatch(dispatcher: AsyncEmptyDispatcher, value?: undefined, catcherObj?: Catcher): void; // prettier-ignore
export function dispatch<C extends string>(dispatcher: AsyncEmptyDispatcher, value: undefined, catcherObj: { [K in C]: Catcher }, catcherKey: C): void; // prettier-ignore
// Overrides for typed dispatchers.
export function dispatch<T>(dispatcher: AsyncDispatcher<T>, value: Resolvable<T>, catcherObj?: Catcher): void; // prettier-ignore
export function dispatch<T, C extends string>(dispatcher: AsyncDispatcher<T>, value: Resolvable<T>, catcherObj: { [K in C]: Catcher }, catcherKey: C): void; // prettier-ignore
// Overrides for unknown dispatchers.
export function dispatch(dispatcher: AsyncDispatcher<unknown>, value: unknown, catcherObj?: Catcher): void; // prettier-ignore
export function dispatch<C extends string>(dispatcher: AsyncDispatcher<unknown>, value: unknown, catcherObj: { [K in C]: Catcher }, catcherKey: C): void; // prettier-ignore
// Definition.
export function dispatch<T, C extends string>(
	dispatcher: AsyncDispatcher<T>,
	value: Resolvable<T>,
	catcherObj?: Catcher | { [K in C]: Catcher },
	catcherKey?: C,
): void {
	if (value instanceof Promise) return void _asyncDispatch(dispatcher, value, catcherObj);
	try {
		if (value !== SKIP) {
			const returned = dispatcher(value);
			if (returned instanceof Promise) void awaitSafely(returned, catcherObj, catcherKey);
		}
	} catch (thrown: unknown) {
		dispatchToCatcher(thrown, catcherObj, catcherKey);
	}
}
// Async definition (used when a promised value is received).
export async function _asyncDispatch<T, C extends string>(
	dispatcher: AsyncDispatcher<T>,
	value: Promise<T | typeof SKIP>,
	catcherObj?: Catcher | { [K in C]: Catcher },
	catcherKey?: C,
): Promise<void> {
	try {
		const awaited = await value;
		if (awaited !== SKIP) await dispatcher(awaited);
	} catch (thrown) {
		dispatchToCatcher(thrown, catcherObj, catcherKey);
	}
}

/**
 * Method dispatch: call a dispatcher method on an object safely.
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
// Overrides for empty dispatchers.
export function thispatch<M extends string>(obj: { [K in M]?: AsyncEmptyDispatcher }, key: M, value?: undefined, catcherObj?: Catcher): void; // prettier-ignore
export function thispatch<M extends string, C extends string>( obj: { [K in M]?: AsyncEmptyDispatcher }, key: M, value: undefined, catcherObj: { [K in C]: Catcher }, catcherKey: C, ): void; // prettier-ignore
// Overrides for typed dispatchers.
export function thispatch<M extends string, T>(obj: { [K in M]?: AsyncDispatcher<T> }, key: M, value: Resolvable<T>, catcherObj?: Catcher): void; // prettier-ignore
export function thispatch<M extends string, C extends string, T>( obj: { [K in M]?: AsyncDispatcher<T> }, key: M, value: Resolvable<T>, catcherObj: { [K in C]: Catcher }, catcherKey: C): void; // prettier-ignore
// Overrides for unknown dispatchers.
export function thispatch<M extends string>(obj: { [K in M]?: AsyncDispatcher<unknown> }, key: M, value: unknown, catcherObj?: Catcher): void; // prettier-ignore
export function thispatch<M extends string, C extends string>(obj: { [K in M]?: AsyncDispatcher<unknown> }, key: M, value: unknown, catcherObj: { [K in C]: Catcher }, catcherKey: C): void; // prettier-ignore
// Definition.
export function thispatch<T, M extends string, C extends string>(
	obj: { [K in M]?: AsyncDispatcher<T> },
	key: M,
	value: Resolvable<T>,
	catcherObj?: Catcher | { [K in C]: Catcher },
	catcherKey?: C,
): void {
	if (value instanceof Promise) return void _asyncMethodDispatch(obj, key, value, catcherObj);
	try {
		if (value !== SKIP) {
			const returned = obj[key]?.(value);
			if (returned instanceof Promise) void awaitSafely(returned, catcherObj, catcherKey);
		}
	} catch (thrown: unknown) {
		void dispatchToCatcher(thrown, catcherObj, catcherKey);
	}
}
// Async definition (used when a promised value is received).
async function _asyncMethodDispatch<T, M extends string, C extends string>(
	obj: { [K in M]?: AsyncDispatcher<T> },
	method: M,
	value: Promise<T | typeof SKIP>,
	catcher?: Catcher | { [K in C]: Catcher },
	catcherMethod?: C,
): Promise<void> {
	try {
		const awaited = await value;
		if (awaited !== SKIP) await obj[method]?.(awaited);
	} catch (thrown) {
		void dispatchToCatcher(thrown, catcher, catcherMethod);
	}
}

/** Wait for a value to resolve and if it throws call a catcher. */
async function awaitSafely<T, C extends string>(promised: Promise<T>, catcher?: Catcher | { [K in C]: Catcher }, method?: C) {
	try {
		await promised;
	} catch (thrown) {
		dispatchToCatcher(thrown, catcher, method);
	}
}

/** Dispatch a thrown value to a catcher. */
function dispatchToCatcher<C extends string>(thrown: unknown, catcher?: Catcher | { [K in C]: Catcher }, method?: C) {
	catcher instanceof Function ? catcher(thrown) : catcher && typeof method === "string" ? catcher[method](thrown) : logError(thrown);
}
