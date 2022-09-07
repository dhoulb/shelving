/* eslint-disable @typescript-eslint/ban-types */

import { AssertionError } from "../error/AssertionError.js";
import { Arguments, assertFunction } from "./function.js";
import { debug } from "./debug.js";

/** Class that has a public `constructor()` function. */
export type Constructor<T, A extends Arguments> = new (...args: A) => T;

/** Any function arguments (designed for use with `extends Arguments` guards). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyConstructor = new (...args: any) => any; // Note: `any` works better than `any[]` for `args`

/** Class prototype that can be used with `instanceof` (string name, as per `Function`, and a prototype field matching the object). */
export type Class<T = unknown> = Function & { prototype: T };

/** Is a given value a class constructor? */
export const isConstructor = <T extends AnyConstructor>(v: T | unknown): v is T => typeof v === "function" && v.toString().startsWith("class");

/** Is a value an instance of a class? */
export const isInstance = <T>(v: unknown, type: Class<T>): v is T => v instanceof type;

/** Assert that a value is an instance of something. */
export function assertInstance<T>(v: T | unknown, type: Class<T>): asserts v is T {
	if (!(v instanceof type)) throw new AssertionError(`Must be instance of ${debug(type)}`, v);
}

/** Decorator to bind a class method lazily on first access. */
export function bindMethod<O, T, A>(target: O, key: string, { value: method }: TypedPropertyDescriptor<(...args: A[]) => T>): TypedPropertyDescriptor<(...args: A[]) => T> {
	assertFunction(method);
	return {
		configurable: true,
		get(): (...args: A[]) => T {
			const bound = method.bind<O, A, T>(target);
			Object.defineProperty(target, key, { value: bound, configurable: false, writable: false, enumerable: false });
			return bound;
		},
	};
}

/**
 * Decorator to cache the result of a class method.
 * - Use this if a method computes an expensive value and you want to use it multiple times.
 * - Gets the method's result the first time the property is accessed, then saves that returned value in the object forever.
 */
export function cacheMethod<O, T, A extends Arguments>(target: O, key: string, { value: method }: TypedPropertyDescriptor<(this: O, ...args: A) => T>): TypedPropertyDescriptor<(this: O, ...args: A) => T> {
	assertFunction(method);
	return {
		configurable: true,
		get(): (...args: A) => T {
			return (...args: A): T => {
				const value = method.call(target, ...args);
				Object.defineProperty(target, key, { value: () => value, configurable: false, writable: false, enumerable: false });
				return value;
			};
		},
	};
}

/**
 * Decorator to cache the result of a class property getter.
 * - Gets the result the first time the property is accessed, then saves that returned value in the object forever.
 */
export function cacheGetter<T>(target: Object, key: string, { get }: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> {
	assertFunction(get);
	return {
		configurable: true,
		get() {
			const value = get.call(this);
			Object.defineProperty(this, key, { value, configurable: false, writable: false, enumerable: false });
			return value;
		},
	};
}

/**
 * Decorator to set a property on an class's prototype not the class itself.
 *
 * @example
 * 		class MyClass {
 * 			\@setPrototype("myProp", "myValue!") readonly myProp!: string;
 * 		}
 */
export function setPrototype<K extends PropertyKey, T>(key: K, value: T): (prototype: { [J in K]: T }, k: K) => void {
	return (prototype: { [J in K]: T }) => {
		prototype[key] = value;
	};
}
