import { Errors } from "../error/Errors.js";
import { awaitErrors, isAsync } from "./async.js";
import { type Callback, isFunction } from "./function.js";
import { isNullish, type Nullish, notNullish } from "./null.js";
import { isObject } from "./object.js";

/**
 * Temporary polyfill for `Symbol.dipose` value.
 * @todo Remove this once browsers support `Symbol.dispose`
 */
(Symbol as { dispose: symbol }).dispose ??= Symbol("Symbol.dispose");
(Symbol as { asyncDispose: symbol }).asyncDispose ??= Symbol("Symbol.asyncDispose");

/**
 * Safely dispose one or more synchronous `Disposable` values.
 * - If one disposal fails, the rest continue.
 *
 * @param values Zero or more disposables or callbacks.
 * - Callbacks are allowed because in real usage `[Symbol.asyncDispose]` may have other things to clean up too and it's neater to throw a single aggregate error.
 * - `Nullish` values are skipped (for convenience).
 *
 * @throws {Errors} Error that aggregates all the disposal errors.
 */
export function dispose(...values: Nullish<Disposable | Callback>[]): void {
	const errors: unknown[] = [];
	for (const value of values) {
		if (isNullish(value)) continue;
		try {
			if (Symbol.dispose in value) value[Symbol.dispose]();
			else if (isFunction(value)) value();
		} catch (thrown) {
			errors.push(thrown);
		}
	}
	if (errors.length) throw new Errors(errors, "Disposal failed", { caller: dispose });
}

/**
 * Safely dispose one or more `AsyncDisposable` or `Disposable` values in parallel — all are disposed even if some throw, errors are rethrown at the end.
 *
 * @param values Zero or more (possibly async) disposables, promises, or callbacks.
 * - Note that spec says `[Symbol.dispose]` is called on an object if `[Symbol.asyncDispose]` is not found.
 * - `Promises` and `Callback` are allowed because in real usage `[Symbol.asyncDispose]` may have other things to clean up too and it's neater to throw a single aggregate error.
 * - `Nullish` values are skipped (for convenience).
 *
 * @throws {Errors} Error that aggregates all the disposal errors.
 */
export async function awaitDispose(...values: Nullish<AsyncDisposable | Disposable | Callback | Promise<unknown>>[]): Promise<void> {
	const errors = await awaitErrors(...values.filter(notNullish).map(_disposeAsync));
	if (errors.length) throw new Errors(errors, "Async disposal failed", { caller: awaitDispose });
}
async function _disposeAsync(value: AsyncDisposable | Disposable | Callback | Promise<unknown>): Promise<void> {
	if (Symbol.asyncDispose in value) await value[Symbol.asyncDispose]();
	else if (Symbol.dispose in value) value[Symbol.dispose]();
	else if (isAsync(value)) await value;
	else if (isFunction(value)) value();
}

/** Is an unknown value a disposable object? */
export function isDisposable(v: unknown): v is Disposable {
	return isObject(v) && typeof v[Symbol.dispose] === "function";
}

/** Is an unknown value an async disposable object? */
export function isAsyncDisposable(v: unknown): v is AsyncDisposable {
	return isObject(v) && typeof v[Symbol.asyncDispose] === "function";
}

/**
 * Version of `Map` that has disposable values.
 * - Old values are disposed when they're set to a new value.
 * - Values are disposed when they're deleted from the map.
 * - Values are disposed when all items are cleared.
 * - All items are cleared and their values are disposed when this map itself is disposed.
 */
export class DisposableMap<K, T extends Disposable> extends Map<K, T> implements Disposable {
	override set(key: K, value: T): this {
		const previous = this.get(key);
		if (previous && previous !== value) dispose(previous);
		return super.set(key, value);
	}
	override delete(key: K): boolean {
		const value = this.get(key);
		if (value) dispose(value);
		return super.delete(key);
	}
	override clear(): void {
		dispose(...this.values());
		super.clear();
	}
	[Symbol.dispose]() {
		this.clear();
	}
}

/**
 * Version of `Set` that has disposable items.
 * - Values are disposed when they're deleted from the map.
 * - Values are disposed when all items are cleared.
 * - All items are cleared (and disposed) when this map itself is disposed.
 */
export class DisposableSet<T extends Disposable> extends Set<T> implements Disposable {
	override delete(item: T): boolean {
		if (this.has(item)) dispose(item);
		return super.delete(item);
	}
	override clear(): void {
		dispose(...this);
		super.clear();
	}
	[Symbol.dispose]() {
		this.clear();
	}
}
