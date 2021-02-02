/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Any function.
 * - Consistency with `AnyConstructor`
 * - Designed to be used with `extends AnyFunction` guards.
 * - Exists because it's hard to remember the `...args: any[]` syntax, and annoying to allow the `any` every time.
 */
export type AnyFunction = (...args: any[]) => unknown;
