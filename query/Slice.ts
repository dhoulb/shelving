import type { ReadonlyEntries, Data } from "shelving/tools";
import { Rule } from "./Rule";

export class Slice<D extends Data = Data> extends Rule<D> {
	readonly limit: number | null;

	constructor(limit: number | null) {
		super();
		this.limit = limit;
	}

	apply(entries: ReadonlyEntries<D>): ReadonlyEntries<D> {
		if (!entries.length) return entries;
		if (this.limit !== null && entries.length > this.limit) return entries.slice(0, this.limit);
		return entries;
	}

	// Implement toString()
	toString(): string {
		return `limit:${typeof this.limit === "number" ? this.limit : "null"}`;
	}
}
