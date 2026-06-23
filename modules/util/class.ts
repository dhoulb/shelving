import { RequiredError } from "../error/RequiredError.js";
import type { Arguments } from "./function.js";

/**
 * Class that has a public `constructor()` function.
 *
 * @see https://shelving.cc/util/class/Constructor
 */
export type Constructor<T, A extends Arguments> = new (...args: A) => T;

/**
 * Any class constructor (designed for use with `extends AnyConstructor` guards).
 *
 * @see https://shelving.cc/util/class/AnyConstructor
 */
// biome-ignore lint/suspicious/noExplicitAny: `unknown` causes edge case matching issues.
export type AnyConstructor = new (...args: any) => any;

/**
 * Class prototype that can be used with `instanceof`.
 *
 * @see https://shelving.cc/util/class/Class
 */
// biome-ignore lint/suspicious/noExplicitAny: `unknown` causes edge case matching issues.
export type Class<T> = new (...args: any) => T;

/**
 * Is a given value a class constructor?
 *
 * @param value The value to test.
 * @returns `true` if `value` is a class constructor, narrowing its type.
 * @example isConstructor(class {}) // true
 * @see https://shelving.cc/util/class/isConstructor
 */
export function isConstructor(value: unknown): value is AnyConstructor {
	return typeof value === "function" && value.toString().startsWith("class");
}

/**
 * Is a value an instance of a class?
 *
 * @param value The value to test.
 * @param type The class to test `value` against.
 * @returns `true` if `value` is an instance of `type`, narrowing its type.
 * @example isInstance(new Date(), Date) // true
 * @see https://shelving.cc/util/class/isInstance
 */
export function isInstance<T>(value: unknown, type: Class<T>): value is T {
	return value instanceof type;
}

/**
 * Assert that a value is an instance of something.
 *
 * @param value The value to assert.
 * @param type The class `value` must be an instance of.
 * @throws {RequiredError} If `value` is not an instance of `type`.
 * @example assertInstance(new Date(), Date); // passes
 * @see https://shelving.cc/util/class/assertInstance
 */
export function assertInstance<T>(value: unknown, type: Class<T>): asserts value is T {
	if (!(value instanceof type))
		throw new RequiredError(`Must be instance of class "${type.name}"`, { received: value, expected: type, caller: assertInstance });
}

/**
 * Get the 'getter' function for a given property, or `undefined` if it doesn't exist.
 *
 * @param obj The object to read the property descriptor from.
 * @param prop The property name to look up.
 * @returns The getter function bound to `T`, or `undefined` if the property has no getter.
 * @example getGetter(obj, "size") // () => number | undefined
 * @see https://shelving.cc/util/class/getGetter
 */
// biome-ignore lint/complexity/noBannedTypes: This is correct here.
export function getGetter<T extends Object, K extends keyof T>(obj: T, prop: K): ((this: T) => T[K]) | undefined {
	const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
	return descriptor && typeof descriptor.get === "function" ? descriptor.get : undefined;
}

/**
 * Get the 'setter' function for a given property, or `undefined` if it doesn't exist.
 *
 * @param obj The object whose prototype is searched for the property descriptor.
 * @param prop The property name to look up.
 * @returns The setter function bound to `T`, or `undefined` if the property has no setter.
 * @example getSetter(obj, "size") // (value: number) => void | undefined
 * @see https://shelving.cc/util/class/getSetter
 */
// biome-ignore lint/complexity/noBannedTypes: This is correct here.
export function getSetter<T extends Object, K extends keyof T>(obj: T, prop: K): ((this: T, value: T[K]) => void) | undefined {
	const descriptor = Object.getOwnPropertyDescriptor(obj.constructor.prototype, prop);
	return descriptor && typeof descriptor.set === "function" ? descriptor.set : undefined;
}
