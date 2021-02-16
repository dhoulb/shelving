/**
 * Any function.
 * - Consistency with `AnyConstructor`
 * - Designed to be used with `extends AnyFunction` guards.
 * - Exists because it's hard to remember the `...args: any[]` syntax, and annoying to disable `no-explicit-any` every time.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFunction = (...args: any[]) => unknown;
