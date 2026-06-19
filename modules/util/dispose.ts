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
 * @example dispose(resource, () => clearTimeout(id)) // disposes both, even if one throws
 * @see https://dhoulb.github.io/shelving/util/dispose/dispose
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
 *
 * @example await awaitDispose(asyncResource, promise, () => cleanup()) // disposes all in parallel
 * @see https://dhoulb.github.io/shelving/util/dispose/awaitDispose
 *
 * @todo Potentially rewrite this to use `AsyncDisposableStack` internally.
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

/**
 * Is an unknown value a disposable object?
 *
 * @param v The value to test.
 * @returns `true` if `v` has a `[Symbol.dispose]` method, narrowing its type to `Disposable`.
 * @see https://dhoulb.github.io/shelving/util/dispose/isDisposable
 */
export function isDisposable(v: unknown): v is Disposable {
	return isObject(v) && typeof v[Symbol.dispose] === "function";
}

/**
 * Is an unknown value an async disposable object?
 *
 * @param v The value to test.
 * @returns `true` if `v` has a `[Symbol.asyncDispose]` method, narrowing its type to `AsyncDisposable`.
 * @see https://dhoulb.github.io/shelving/util/dispose/isAsyncDisposable
 */
export function isAsyncDisposable(v: unknown): v is AsyncDisposable {
	return isObject(v) && typeof v[Symbol.asyncDispose] === "function";
}

/**
 * Version of `Map` that has disposable values.
 * - Old values are disposed when they're set to a new value.
 * - Values are disposed when they're deleted from the map.
 * - Values are disposed when all items are cleared.
 * - All items are cleared and their values are disposed when this map itself is disposed.
 *
 * @see https://dhoulb.github.io/shelving/util/dispose/DisposableMap
 */
export class DisposableMap<K, T extends Disposable> extends Map<K, T> implements Disposable {
	/**
	 * Set a key to a value, disposing any previous value stored under that key.
	 *
	 * @param key The key to set.
	 * @param value The disposable value to store.
	 * @returns This map, for chaining.
	 * @example map.set("a", resource) // disposes the old "a" value if it differs
	 * @see https://dhoulb.github.io/shelving/util/dispose/DisposableMap/set
	 */
	override set(key: K, value: T): this {
		const previous = this.get(key);
		if (previous && previous !== value) dispose(previous);
		return super.set(key, value);
	}
	/**
	 * Delete a key, disposing its value.
	 *
	 * @param key The key to delete.
	 * @returns `true` if a value existed and was deleted, otherwise `false`.
	 * @example map.delete("a") // disposes the "a" value
	 * @see https://dhoulb.github.io/shelving/util/dispose/DisposableMap/delete
	 */
	override delete(key: K): boolean {
		const value = this.get(key);
		if (value) dispose(value);
		return super.delete(key);
	}
	/**
	 * Clear all items, disposing every value.
	 *
	 * @returns Nothing.
	 * @example map.clear() // disposes every value
	 * @see https://dhoulb.github.io/shelving/util/dispose/DisposableMap/clear
	 */
	override clear(): void {
		dispose(...this.values());
		super.clear();
	}
	/**
	 * Dispose this map by clearing all items and disposing their values.
	 *
	 * @returns Nothing.
	 * @see https://dhoulb.github.io/shelving/util/dispose/DisposableMap/dispose
	 */
	[Symbol.dispose]() {
		this.clear();
	}
}

/**
 * Version of `Set` that has disposable items.
 * - Values are disposed when they're deleted from the map.
 * - Values are disposed when all items are cleared.
 * - All items are cleared (and disposed) when this map itself is disposed.
 *
 * @see https://dhoulb.github.io/shelving/util/dispose/DisposableSet
 */
export class DisposableSet<T extends Disposable> extends Set<T> implements Disposable {
	/**
	 * Delete an item, disposing it.
	 *
	 * @param item The item to delete.
	 * @returns `true` if the item existed and was deleted, otherwise `false`.
	 * @example set.delete(resource) // disposes the item
	 * @see https://dhoulb.github.io/shelving/util/dispose/DisposableSet/delete
	 */
	override delete(item: T): boolean {
		if (this.has(item)) dispose(item);
		return super.delete(item);
	}
	/**
	 * Clear all items, disposing each one.
	 *
	 * @returns Nothing.
	 * @example set.clear() // disposes every item
	 * @see https://dhoulb.github.io/shelving/util/dispose/DisposableSet/clear
	 */
	override clear(): void {
		dispose(...this);
		super.clear();
	}
	/**
	 * Dispose this set by clearing all items and disposing each one.
	 *
	 * @returns Nothing.
	 * @see https://dhoulb.github.io/shelving/util/dispose/DisposableSet/dispose
	 */
	[Symbol.dispose]() {
		this.clear();
	}
}
