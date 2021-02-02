import type { DeepPartial, ImmutableObject } from "../object";

/**
 * Data: an object with string keys containing only plain values.
 * - This subset of values is likely to be supported by most database engines.
 */
export type Data = { readonly [key: string]: Plain };
export type Plain = number | string | boolean | null | readonly Plain[] | Data;

/** Result: a result for document (i.e. the document's value or `undefined` if the document didn't exist. */
export type Result<T extends ImmutableObject> = T | undefined;

/** Results: a set of results for documents indexed by their ID (`undefined` isn't applicable because documents that don't exist won't appear in the results). */
export type Results<T extends ImmutableObject> = { readonly [id: string]: T };

/** Change: a change to some data (where `undefined` indicates deletion). */
export type Change<T extends ImmutableObject> = T | DeepPartial<T>;

/** Changes: a set of changes to multiple documents indexed by their ID. */
export type Changes<T extends ImmutableObject> = { readonly [id: string]: Change<T> | undefined };
