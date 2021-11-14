import type { SKIP } from "./constants.js";
import { RequiredError } from "./error.js";

/** Data: an object with string keys containing only plain values. */
export type Data = { readonly [key: string]: Plain };

/** Datas: an object containing named `Data` objects. */
export type Datas = { readonly [key: string]: Data };

/** Plain: any plain value likely to be supported by most database engines. */
export type Plain = number | string | boolean | null | readonly Plain[] | Data;

/** Result: the data for a document (if it exists) or `undefined` (if it doesn't). */
export type Result<T extends Data = Data> = T | undefined;

/** Results: a set of results for documents indexed by their ID. */
export type Results<T extends Data = Data> = { readonly [id: string]: T };

/** Resolvable value. */
export type Resolvable<T> = typeof SKIP | T | Promise<typeof SKIP | T>;

/**
 * Get a required value.
 * @returns Value if it's not `undefined`
 * @throws RequiredError if value is `undefined`
 */
export function getRequired<T>(v: T): Exclude<T, undefined> {
	if (v === undefined) throw new RequiredError("Required value is undefined");
	return v as Exclude<T, undefined>;
}
