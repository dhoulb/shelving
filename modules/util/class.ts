/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import type { Arguments, AnyFunction } from "./function.js";
import type { EmptyObject, ImmutableObject } from "./object.js";
import { assertFunction } from "./assert.js";
import { isUppercaseLetter } from "./string.js";

/**
 * Constructor: a class constructor that can be used with `new X` to generate an object of type `T`
 */
// The `Function & prototype` form matches classes which have `protected constructor()` (which are not matched by the `new` form).
export type Class<T extends EmptyObject | ImmutableObject> = (new (...args: any[]) => T) | (Function & { prototype: T });

/**
 * Any class constructor.
 * - Consistency with `AnyFunction`
 * - Designed to be used with `extends AnyConstructor` guards.
 * - Exists because it's hard to remember the `...args: any[]` syntax, and annoying to allow the `any` every time.
 */
export type AnyClass = new (...args: any) => any;

/** Is a given value a class constructor? */
export const isClass = <T extends AnyClass>(v: T | unknown): v is T =>
	typeof v === "function" && v.prototype && v.prototype.name && isUppercaseLetter(v.prototype.name);

/** Bind a class method (lazily on first access). */
export function bindMethod<T extends AnyFunction>(target: Object, key: string, { value: method }: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> {
	assertFunction(method);
	return {
		configurable: true,
		get(): T {
			const bound: T = method.bind(this) as T;
			Object.defineProperty(this, key, { value: bound, configurable: false, writable: false });
			return bound;
		},
	};
}

/**
 * Cache the result of a class property getter.
 * - Gets the result the first time the property is accessed, then saves that returned value in the object forever.
 */
export function cacheGetter<T>(target: Object, key: string, { get }: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> {
	assertFunction(get);
	return {
		configurable: true,
		get() {
			const value = get.call(this);
			Object.defineProperty(this, key, { value, configurable: false, writable: false });
			return value;
		},
	};
}

/**
 * Cache the result of a class method.
 * - Use this if a method computes an expensive value and you want to use it multiple times.
 * - Gets the method's result the first time the property is accessed, then saves that returned value in the object forever.
 */
export function cacheMethod<T, A extends Arguments>(
	target: Object,
	key: string,
	{ value: method }: TypedPropertyDescriptor<(...args: A) => T>,
): TypedPropertyDescriptor<(...args: A) => T> {
	assertFunction(method);
	return {
		configurable: true,
		get(): (...args: A) => T {
			return (...args: A): T => {
				const value: T = method.call(this, ...args);
				Object.defineProperty(this, key, { value: () => value, configurable: false, writable: false });
				return value;
			};
		},
	};
}
