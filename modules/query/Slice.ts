import type { ImmutableEntries, Data, Results } from "../util/index.js";
import { Rule } from "./Rule.js";

export class Slice<T extends Data> extends Rule<T> {
	readonly limit: number | null;

	constructor(limit: number | null) {
		super();
		this.limit = limit;
	}

	override queryResults(results: Results<T>): Results<T> {
		return this.limit === null ? results : super.queryResults(results);
	}

	override queryEntries(entries: ImmutableEntries<T>): ImmutableEntries<T> {
		if (!entries.length) return entries;
		if (this.limit !== null && entries.length > this.limit) return entries.slice(0, this.limit);
		return entries;
	}

	// Implement toString()
	override toString(): string {
		return `limit=${typeof this.limit === "number" ? this.limit : "null"}`;
	}
}
