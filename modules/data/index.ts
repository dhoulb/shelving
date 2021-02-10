/**
 * Data: an object with string keys containing only plain values.
 * - This subset of values is likely to be supported by most database engines.
 */
export type Data = { readonly [key: string]: Plain };
export type Plain = number | string | boolean | null | readonly Plain[] | Data;

/** Result: a result for document (i.e. the document's value or explicit `undefined` if the document didn't exist. */
export type Result<T extends Data> = T | undefined;

/** Results: a set of results for documents indexed by their ID. */
export type Results<T extends Data> = { readonly [id: string]: T };
