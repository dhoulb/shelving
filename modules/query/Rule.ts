import type { Data, Results } from "../data";
import type { ImmutableEntries, Entry } from "../entry";
import { Cloneable, cloneObject } from "../clone";
import { objectFromEntries } from "../object";
import { bindMethod } from "../class";
import { filter } from "../filter";

/** Something that can be used to query against a result set or an array of entries. */
export abstract class Rule<T extends Data> implements Cloneable {
	/**
	 * Match an individual document against this rule.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	match(id: string, data: T): boolean {
		return true;
	}

	/**
	 * Return a `Matcher` function that can filter an array of entries
	 */
	@bindMethod // Bind this so we can use it directly in `filter()`
	matcher([id, data]: Entry<T>): boolean {
		return this.match(id, data);
	}

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
	apply(entries: ImmutableEntries<T>): ImmutableEntries<T> {
		if (!entries.length) return entries;
		return filter(entries, this.matcher);
	}

	// Implement toString()
	abstract toString(): string;

	// Implement Cloneable.
	clone(): this {
		return cloneObject(this);
	}
}
