/* eslint-disable @typescript-eslint/no-explicit-any */

import { EmptyObject, ImmutableObject } from "../object";

/**
 * Constructor: a class constructor that can be used with `new X` to generate an object of type `T`
 */
export type Constructor<T extends EmptyObject | ImmutableObject> = new (...args: any[]) => T;

/**
 * Any class constructor.
 * - Consistency with `AnyFunction`
 * - Designed to be used with `extends AnyConstructor` guards.
 * - Exists because it's hard to remember the `...args: any[]` syntax, and annoying to allow the `any` every time.
 */
export type AnyConstructor = new (...args: any[]) => unknown;

/**
 * Constructor type: extract the type for a constructor.
 * - Consistency with builtin `ReturnType<T>` and our `ObjectType<T>`
 * - Already available with builtin `InstanceType<T>` so this is just for consistency.
 * - Note `ConstructorParameters<T>` is also builtin.
 */
export type ConstructorType<T extends AnyConstructor> = T extends Constructor<infer X> ? X : never;
