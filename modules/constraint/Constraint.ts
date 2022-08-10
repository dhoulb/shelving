import type { Data } from "../util/data.js";
import type { Transformable } from "../util/transform.js";

/** Something that can be used to constrain a query. */
export abstract class Constraint<T extends Data> implements Transformable<Iterable<T>, Iterable<T>> {
	// Apply this constraint to a set of items.
	abstract transform(items: Iterable<T>): Iterable<T>;

	// Implement toString()
	abstract toString(): string;
}
