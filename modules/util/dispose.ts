import { UnexpectedError } from "../error/UnexpectedError.js";
import type { AnyCaller } from "./function.js";
import { isObject } from "./object.js";

/**
 * Temporary polyfill for `Symbol.dipose` value.
 * @todo Remove this once browsers support `Symbol.dispose`
 */
(Symbol as { dispose: symbol }).dispose ??= Symbol("Symbol.dispose");

/** Safely dispose a disposable. */
export function dispose(value: Disposable, caller: AnyCaller = dispose): void {
	try {
		value[Symbol.dispose]();
	} catch (thrown) {
		throw new UnexpectedError("Unexpected error in dispose method", { disposable: value, cause: thrown, caller });
	}
}

/** Is an unknown value a disposable object? */
export function isDisposable(v: unknown): v is Disposable {
	return isObject(v) && typeof v[Symbol.dispose] === "function";
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
		if (previous && previous !== value) dispose(previous, this.set);
		return super.set(key, value);
	}
	override delete(key: K): boolean {
		const value = this.get(key);
		if (value) dispose(value, this.delete);
		return super.delete(key);
	}
	override clear(): void {
		for (const value of this.values()) dispose(value, this.clear);
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
		if (this.has(item)) dispose(item, this.delete);
		return super.delete(item);
	}
	override clear(): void {
		for (const item of this) dispose(item, this.clear);
		super.clear();
	}
	[Symbol.dispose]() {
		this.clear();
	}
}
