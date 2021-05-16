import { filter, MATCH, Operator } from "../filter";
import { Entry, ImmutableEntries } from "../entry";
import { bindMethod } from "../class";
import { Rule } from "./Rule";
import { getQueryProp } from "./helpers";
import type { Data } from "../data";

/**
 * Filter: filters a list of documents.
 *
 * @param key The name of a property that might exist on documents in the collection.
 * @param type MatchType reference, e.g. `is` or `contains`
 * @param value Value the specified property should be matched against.
 */
export class Filter<T extends Data> extends Rule<T> {
	readonly key: "id" | string;
	readonly operator: Operator;
	readonly value: unknown;

	constructor(key: "id" | string, operator: Operator, value: unknown) {
		super();
		this.key = key;
		this.operator = operator;
		this.value = value;
	}

	match(id: string, data: T): boolean {
		return MATCH[this.operator](getQueryProp(id, data, this.key), this.value);
	}

	/**
	 * Return a `Matcher` function that can filter an array of entries
	 */
	@bindMethod // Bind this so we can use it directly in `filter()`
	matcher([id, data]: Entry<T>): boolean {
		return this.match(id, data);
	}

	// Implement apply()
	apply(entries: ImmutableEntries<T>): ImmutableEntries<T> {
		if (!entries.length) return entries;
		return filter(entries, this.matcher);
	}

	// Implement toString()
	toString(): string {
		return `${this.key}:${this.operator}=${JSON.stringify(this.value)}`;
	}
}
