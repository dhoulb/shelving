import { getProp, ImmutableObject } from "../object";

/**
 * Get a named property value from some data.
 * - For using in `Query` and `Filter` and `Sort` etc.
 * - `"id"` is a special case and always returns the ID.
 * - Anything else assumes the entry value is an object and looks up that named prop in the data.
 */
export const getQueryProp = <T extends ImmutableObject, K extends "id" | keyof T>(id: string, data: T, key: K): K extends "id" ? string : T[K] =>
	(key === "id" ? id : getProp(data, key)) as K extends "id" ? string : T[K];
