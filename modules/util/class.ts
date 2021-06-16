/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Arguments } from "./function";
import type { EmptyObject, ImmutableObject } from "./object";
import { assertFunction } from "./assert";

/**
 * Constructor: a class constructor that can be used with `new X` to generate an object of type `T`
 */
// The `Function & prototype` form matches classes which have `protected constructor()` (which are not matched by the `new` form).
// eslint-disable-next-line @typescript-eslint/ban-types
export type Class<T extends EmptyObject | ImmutableObject> = (new (...args: any[]) => T) | (Function & { prototype: T });

/**
 * Any class constructor.
 * - Consistency with `AnyFunction`
 * - Designed to be used with `extends AnyConstructor` guards.
 * - Exists because it's hard to remember the `...args: any[]` syntax, and annoying to allow the `any` every time.
 */
export type AnyClass = new (...args: any) => any;

/** Bind a class method (lazily on first access). */
// eslint-disable-next-line @typescript-eslint/ban-types
export function bindMethod(target: object, key: string, { value: method }: PropertyDescriptor): PropertyDescriptor {
	assertFunction(method);
	return {
		configurable: true,
		get() {
			const bound = method.bind(this);
			Object.defineProperty(this, key, { value: bound, configurable: false, writable: false });
			return bound;
		},
	};
}

/**
 * Cache the result of a class property getter.
 * - Gets the result the first time the property is accessed, then saves that returned value in the object forever.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function cacheGetter(target: object, key: string, { get }: PropertyDescriptor): PropertyDescriptor {
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
// eslint-disable-next-line @typescript-eslint/ban-types
export function cacheMethod(target: object, key: string, { value: method }: PropertyDescriptor): PropertyDescriptor {
	assertFunction(method);
	return {
		configurable: true,
		get() {
			return (...args: Arguments) => {
				const value = method.call(this, ...args);
				Object.defineProperty(this, key, { value: () => value, configurable: false, writable: false });
				return value;
			};
		},
	};
}
