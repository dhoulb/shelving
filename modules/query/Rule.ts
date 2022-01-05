import { Data, Transformable, Entries } from "../util/index.js";

/** Something that can be used to query against a result set or an array of entries. */
export abstract class Rule<T extends Data> implements Transformable<Entries<T>, Entries<T>> {
	// Apply this rule to a set of results.
	abstract transform(entries: Entries<T>): Entries<T>;

	// Implement toString()
	abstract toString(): string;
}
