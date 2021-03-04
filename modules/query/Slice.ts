import type { ImmutableEntries } from "../entry";
import type { Data } from "../data";
import { Rule } from "./Rule";

export class Slice<D extends Data> extends Rule<D> {
	readonly limit: number | null;

	constructor(limit: number | null) {
		super();
		this.limit = limit;
	}

	apply(entries: ImmutableEntries<D>): ImmutableEntries<D> {
		if (!entries.length) return entries;
		if (this.limit !== null && entries.length > this.limit) return entries.slice(0, this.limit);
		return entries;
	}

	// Implement toString()
	toString(): string {
		return `limit=${typeof this.limit === "number" ? this.limit : "null"}`;
	}
}
