/** The EQUAL symbol indicates equality. */
export const EQUAL: unique symbol = Symbol("shelving/EQUAL");

/** The SKIP symbol indicates something that should be skipped. */
export const SKIP: unique symbol = Symbol("shelving/SKIP");

/** The EQUAL symbol indicates equality. */
export const LOADING: unique symbol = Symbol("shelving/LOADING");

/** The NOERROR symbol indicates something that definitely isn't an error (because you can throw `undefined` this is sometimes necessary to differentiate) */
export const NOERROR: unique symbol = Symbol("shelving/NOERROR");

/** The NOVALUE symbol indicates something that definitely isn't a value (for situations where `undefined` is a valid value) */
export const NOVALUE: unique symbol = Symbol("shelving/NOVALUE");

/** Function that always returns undefined. */
export const NOFUNC = (): void | undefined => undefined;
