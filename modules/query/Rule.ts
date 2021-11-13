import { Data, Results, ImmutableEntries, objectFromEntries } from "../util/index.js";

/** Something that can be used to query against a result set or an array of entries. */
export abstract class Rule<T extends Data> {
	/**
	 * Apply this rule to an array of entries in `[id, data]` format and return the new array.
	 * @returns Either a new array (if `entries` was modified), or the exact same instance (if no changes were made).
	 */
	abstract queryEntries(entries: ImmutableEntries<T>): ImmutableEntries<T>;

	/**
	 * Apply this rule to a set of results and return the new results.
	 * @returns Either a new Results object (if `results` was modified), or the exact same instance (if no changes were made).
	 */
	queryResults(results: Results<T>): Results<T> {
		const entries = Object.entries(results);
		const applied = this.queryEntries(entries);
		return entries === applied ? results : objectFromEntries(applied);
	}

	// Implement toString()
	abstract toString(): string;
}
