/* eslint-disable @typescript-eslint/no-unused-vars */

import { Cloneable, cloneObject } from "../clone";
import type { Data, Results } from "../data";
import type { MutableEntries, ImmutableEntries } from "../entry";
import { objectFromEntries } from "../object";

/** Something that can be used to query against a result set or an array of entries. */
export abstract class Rule<T extends Data> implements Cloneable {
	/**
	 * Match an individual document against this rule.
	 */
	match(id: string, data: T): boolean {
		return true;
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

	/**
	 * Modify an array of entries (in place, modifying the original object).
	 * @returns The new array, or the exact old array instance if no changes were made.
	 */
	apply(entries: ImmutableEntries<T>): ImmutableEntries<T> {
		if (!entries.length) return entries;
		let changed = false;
		const matched: MutableEntries<T> = [];
		for (const entry of entries) {
			if (this.match(entry[0], entry[1])) matched.push(entry);
			else changed = true;
		}
		return changed ? matched : entries;
	}

	// Implement toString()
	abstract toString(): string;

	// Implement Cloneable.
	clone(): this {
		return cloneObject(this);
	}
}