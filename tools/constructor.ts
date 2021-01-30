/* eslint-disable @typescript-eslint/no-explicit-any */

import { EmptyObject, ReadonlyObject } from "./object";

/**
 * Constructor: a class constructor that can be used with `new X` to generate an object of type `T`
 */
export type Constructor<T extends EmptyObject | ReadonlyObject> = new (...args: any[]) => T;

/**
 * Unknown constructor: any class constructor.
 * - Consistency with `UnknownObject` and `UnknownFunction`
 */
export type UnknownConstructor = new (...args: any[]) => unknown;

/**
 * Array type: extract the type for the items of an array or readonly array.
 * - Consistency with builtin `ReturnType<T>` and our `ObjectType<T>`
 * - Already available with builtin `InstanceType<T>` so this is just for consistency.
 * - Note `ConstructorParameters<T>` is also builtin.
 */
export type ConstructorType<T extends UnknownConstructor> = T extends Constructor<infer X> ? X : never;
