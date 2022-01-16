import { Entry, Data, Key, yieldFiltered, Entries, ImmutableArray, ArrayType } from "../util/index.js";
import type { Filterable, FilterKey, FilterProps } from "./types.js";
import { Filter } from "./Filter.js";
import { Rules } from "./Rules.js";

function* _yieldFilters<T extends Data>(props: FilterProps<T>): Generator<Filter<T>> {
	for (const [key, value] of Object.entries(props)) yield Filter.on<T>(key, value);
}

/** A set of filters. */
export class Filters<T extends Data> extends Rules<T, Filter<T>> implements Filterable<T> {
	/** Create a `Filters` instance from a set of `FilterProps` */
	static on<X extends Data>(filters: FilterProps<X>) {
		return new Filters(..._yieldFilters(filters));
	}

	// Implement `Filterable`
	filter(props: FilterProps<T>): this;
	filter(key: "id" | "!id" | "id>" | "id>=" | "id<" | "id<=", value: string): this;
	filter(key: "id" | "!id", value: ImmutableArray<string>): this;
	filter<K extends Key<T>>(key: `${K}` | `!${K}` | `${K}>` | `${K}>=` | `${K}<` | `${K}<=`, value: T[K]): this;
	filter<K extends Key<T>>(key: `${K}` | `!${K}`, value: ImmutableArray<string>): this;
	filter<K extends Key<T>>(key: `${K}[]`, value: T[K] extends ImmutableArray ? ArrayType<T[K]> : never): this;
	filter(input: FilterKey<T> | FilterProps<T>, value?: unknown): this {
		return typeof input === "string" ? this.with(Filter.on(input, value)) : this.with(..._yieldFilters(input));
	}
	match(entry: Entry<T>): boolean {
		for (const rule of this._rules) if (!rule.match(entry)) return false;
		return true;
	}

	// Implement `Rule`
	transform(iterable: Entries<T>): Entries<T> {
		return this._rules.length ? yieldFiltered(iterable, this) : iterable;
	}
}
