/** Is a value a boolean? */
export const isBoolean = (v: unknown): v is boolean => typeof v === "boolean";

/** Is a value true? */
export const isTrue = (v: unknown): v is true => v === true;

/** Is a value false? */
export const isFalse = (v: unknown): v is false => v === false;

/** Is a value truthy? */
export const isTruthy = (v: unknown): boolean => !!v;

/** Is a value falsey? */
export const isFalsey = (v: unknown): boolean => !v;
