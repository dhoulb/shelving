import type { Data, Results } from "../data";
import type { ImmutableEntries } from "../entry";
import { objectFromEntries } from "../object";

/** Something that can be used to query against a result set or an array of entries. */
export abstract class Rule<T extends Data> {
	/**
	 * Apply this queryable to a set of results and return the (potentially) modified results.
	 * @returns Either a new Results object (if `results` was modified), or the exact same instance (if no changes were made).
	 */
	results(results: Results<T>): Results<T> {
		const entries = Object.entries(results);
		const applied = this.apply(entries);
		return entries === applied ? results : objectFromEntries(applied);
	}

	// Override to call `filter()` on the entries with a custom filter function.
	abstract apply(entries: ImmutableEntries<T>): ImmutableEntries<T>;

	// Implement toString()
	abstract toString(): string;
}
