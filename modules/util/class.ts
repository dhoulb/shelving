/* eslint-disable @typescript-eslint/ban-types */

import type { Arguments, AnyFunction, AnyArguments } from "./function.js";
import type { ImmutableObject } from "./object.js";
import { assertFunction } from "./assert.js";

/** Class that has a public `constructor()` function. */
export type Constructor<T extends ImmutableObject> = new (...args: AnyArguments) => T;

/** Any class that has a public `constructor()` function (designed for use with `extends AnyArguments` guards). */
export type AnyConstructor = new (...args: AnyArguments) => Object;

/** Class prototype that can be used with `instanceof` */
export type Class<T> = Function & { prototype: T };

/** Any class prototype that can be used with `instanceof` (designed for use with `extends AnyClass` guards). */
export type AnyClass = Function & { prototype: Object };

/** Is a given value a class constructor? */
export const isConstructor = <T extends AnyConstructor>(v: T | unknown): v is T => typeof v === "function" && v.toString().startsWith("class");

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
