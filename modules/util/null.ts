/** Is a value null? */
export const isNull = (v: unknown): v is null => v === null;

/** Is a value not null? */
export const isNotNull = <T>(v: T | null): v is T => v !== null;

/** Function that always returns null. */
export const getNull = (): null => null;
