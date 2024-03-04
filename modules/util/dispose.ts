import { logError } from "./error.js";
import { isObject } from "./object.js";

/**
 * Temporary polyfill for `Symbol.dipose` value.
 * @todo Remove this once browsers support `Symbol.dispose`
 */
(Symbol as { dispose: symbol }).dispose ??= Symbol("Symbol.dispose");

/** Safely dispose a disposable. */
export function dispose(value: Disposable): void {
	try {
		value[Symbol.dispose]();
	} catch (thrown) {
		logError(thrown);
	}
}

/** Is an unknown value a disposable object? */
export function isDisposable(v: unknown): v is Disposable {
	return isObject(v) && typeof v[Symbol.dispose] === "function";
}

/**
 * Version of `Map` that is disposable.
 * - If items are `Disposable` they are disposed when they're deleted from the map.
 * - Set itself is `Disposable` to delete (and dispose) all items when the map itself is disposed.
 */
export class DisposableMap<K, T> extends Map<K, T> implements Disposable {
	override delete(key: K): boolean {
		if (this.has(key)) {
			const value = this.get(key) as T;
			super.delete(key);
			if (isDisposable(value)) dispose(value);
			return true;
		}
		return false;
	}
	[Symbol.dispose]() {
		for (const key of this.keys()) this.delete(key);
	}
}

/**
 * Version of `Set` that is disposable.
 * - If items are `Disposable` they are disposed when they're deleted from the set.
 * - Set itself is `Disposable` to delete (and dispose) all items when the set itself is disposed.
 */
export class DisposableSet<T> extends Set<T> implements Disposable {
	override delete(item: T): boolean {
		if (this.has(item)) {
			super.delete(item);
			if (isDisposable(item)) dispose(item);
			return true;
		}
		return false;
	}
	[Symbol.dispose]() {
		for (const item of this) this.delete(item);
	}
}
