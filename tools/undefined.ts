/** Is a value undefined? */
export const isUndefined = (v: unknown): v is undefined => v === undefined;

/** Is a value defined? */
export const isDefined = <T>(v: T | undefined): v is T => v !== undefined;
