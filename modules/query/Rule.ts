import type { Data } from "../util/data.js";
import type { Entries } from "../util/entry.js";
import type { Transformable } from "../util/transform.js";

/** Something that can be used to query against a result set or an array of entries. */
export abstract class Rule<T extends Data> implements Transformable<Entries<T>, Entries<T>> {
	// Apply this rule to a set of results.
	abstract transform(entries: Entries<T>): Entries<T>;

	// Implement toString()
	abstract toString(): string;
}
