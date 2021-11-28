/** Is a value null? */
export const IS_NULL = (v: unknown): v is null => v === null;

/** Is a value not null? */
export const NOT_NULL = <T>(v: T | null): v is T => v !== null;

/** Function that always returns null. */
export const NULL = (): null => null;
