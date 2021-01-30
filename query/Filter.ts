import { Data, Entry, ReadonlyEntries, Keys, getProp, matchers, Matcher, filter, FilterFunction } from "shelving/tools";
import { Rule } from "./Rule";

/**
 * Filter: filters a list of documents.
 *
 * @param key The name of a property that might exist on documents in the collection.
 * @param type Matcher reference, e.g. `is` or `contains`
 * @param value Value the specified property should be matched against.
 */
export class Filter<D extends Data = Data, K extends "id" | Keys<D> = "id" | Keys<D>> extends Rule<D> {
	readonly key: K;
	readonly type: Matcher;
	readonly value: unknown;

	constructor(key: K, type: Matcher, value: unknown) {
		super();
		this.key = key;
		this.type = type;
		this.value = value;
	}

	match(id: string, data: D): boolean {
		return matchers[this.type](this.value, this.key === "id" ? id : getProp(data, this.key));
	}

	// Override to call `filter()` on the entries with a custom filter function.
	apply(entries: ReadonlyEntries<D>): ReadonlyEntries<D> {
		if (!entries.length) return entries;
		return filter(entries, (this._filterFunction ||= ([id, data]) => this.match(id, data)));
	}
	private _filterFunction?: FilterFunction<Entry<D>>; // Store the created filter function so it's not recreated on every `apply()` call.

	// Implement toString()
	toString(): string {
		return `${this.key}:${this.type}:${JSON.stringify(this.value)}`;
	}
}
