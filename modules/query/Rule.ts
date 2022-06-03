import type { Data } from "../util/data.js";
import type { Transformable } from "../util/transform.js";

/** Something that can be used to query against a result set or an array of entries. */
export abstract class Rule<T extends Data> implements Transformable<Iterable<T>, Iterable<T>> {
	// Apply this rule to a set of items.
	abstract transform(items: Iterable<T>): Iterable<T>;

	// Implement toString()
	abstract toString(): string;
}
