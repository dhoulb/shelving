/** The SAME symbol indicates sameness. */
export const SAME: unique symbol = Symbol("shelving/SAME");

/** The LOADING symbol indicates loading. */
export const LOADING: unique symbol = Symbol("shelving/LOADING");

/** The DONE symbol indicates doneness. */
export const DONE: unique symbol = Symbol("shelving/DONE");

/** The ERROR symbol indicates an error state. */
export const ERROR: unique symbol = Symbol("shelving/ERROR");

/** The NOERROR symbol indicates something that definitely isn't an error (because you can throw `undefined` this is sometimes necessary to differentiate) */
export const NOERROR: unique symbol = Symbol("shelving/NOERROR");

/** The NOVALUE symbol indicates something that definitely isn't a value (for situations where `undefined` is a valid value) */
export const NOVALUE: unique symbol = Symbol("shelving/NOVALUE");
