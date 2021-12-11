/** Is a value undefined? */
export const IS_UNDEFINED = (v: unknown): v is undefined => v === undefined;

/** Is a value defined? */
export const IS_DEFINED = <T>(v: T | undefined): v is T => v !== undefined;
export const NOT_UNDEFINED = IS_DEFINED;

/** Function that always returns undefined. */
export const GET_UNDEFINED = (): undefined => undefined;
