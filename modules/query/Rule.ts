import { Data, Transformable, Results } from "../util/index.js";

/** Something that can be used to query against a result set or an array of entries. */
export abstract class Rule<T extends Data> implements Transformable<Results<T>, Results<T>> {
	// Apply this rule to a set of results.
	abstract transform(results: Results<T>): Results<T>;

	// Implement toString()
	abstract toString(): string;
}
