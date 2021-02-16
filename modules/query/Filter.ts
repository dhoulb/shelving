import type { Data } from "../data";
import type { Entry, ImmutableEntries } from "../entry";
import { MATCH, Operator, filter, Filterer } from "../filter";
import { Rule } from "./Rule";
import { getQueryProp } from "./helpers";

/**
 * Filter: filters a list of documents.
 *
 * @param key The name of a property that might exist on documents in the collection.
 * @param type MatchType reference, e.g. `is` or `contains`
 * @param value Value the specified property should be matched against.
 */
export class Filter<T extends Data> extends Rule<T> {
	readonly key: "id" | keyof T;
	readonly operator: Operator;
	readonly value: unknown;

	constructor(key: "id" | keyof T, operator: Operator, value: unknown) {
		super();
		this.key = key;
		this.operator = operator;
		this.value = value;
	}

	match(id: string, data: T): boolean {
		return MATCH[this.operator](getQueryProp(id, data, this.key), this.value);
	}

	// Override to call `filter()` on the entries with a custom filter function.
	apply(entries: ImmutableEntries<T>): ImmutableEntries<T> {
		if (!entries.length) return entries;
		return filter(entries, (this._filterer ||= ([id, data]) => this.match(id, data)));
	}
	private _filterer?: Filterer<Entry<T>>; // Store the created filter function so it's not recreated on every `apply()` call.

	// Implement toString()
	toString(): string {
		return `${this.key}:${this.operator}:${JSON.stringify(this.value)}`;
	}
}
