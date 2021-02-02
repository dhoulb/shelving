import { Data } from "../data";
import { Entry, ImmutableEntries } from "../entry";
import { getProp } from "../object";
import { matchers, Matcher, filter, FilterFunction } from "../filter";
import { Rule } from "./Rule";

/**
 * Filter: filters a list of documents.
 *
 * @param key The name of a property that might exist on documents in the collection.
 * @param type Matcher reference, e.g. `is` or `contains`
 * @param value Value the specified property should be matched against.
 */
export class Filter<T extends Data> extends Rule<T> {
	readonly key: "id" | keyof T;
	readonly type: Matcher;
	readonly value: unknown;

	constructor(key: "id" | keyof T, type: Matcher, value: unknown) {
		super();
		this.key = key;
		this.type = type;
		this.value = value;
	}

	match(id: string, data: T): boolean {
		return matchers[this.type](this.value, this.key === "id" ? id : getProp(data, this.key));
	}

	// Override to call `filter()` on the entries with a custom filter function.
	apply(entries: ImmutableEntries<T>): ImmutableEntries<T> {
		if (!entries.length) return entries;
		return filter(entries, (this._filterFunction ||= ([id, data]) => this.match(id, data)));
	}
	private _filterFunction?: FilterFunction<Entry<T>>; // Store the created filter function so it's not recreated on every `apply()` call.

	// Implement toString()
	toString(): string {
		return `${this.key}:${this.type}:${JSON.stringify(this.value)}`;
	}
}
