import { countItems, Entry, ImmutableObject, LOADING, Resolvable, withEntry, withoutEntry } from "../util/index.js";
import { State } from "./State.js";

/** State that stores a map-like object and has additional methods to help with that. */
export class MapState<T> extends State<ImmutableObject<T>> implements Iterable<Entry<T>> {
	// Set initial value to `{}`
	constructor(initial: Resolvable<ImmutableObject<T>> | typeof LOADING = {}) {
		super(initial);
	}

	/** Count the number of entries in this map-like object. */
	get count(): number {
		return countItems(this.value);
	}

	/** Add an item to this map-like object. */
	add(key: string, item: T): void {
		this.next(withEntry(this.value, key, item));
	}

	/** Remove an item from this map-like object. */
	remove(key: string, item?: T): void {
		this.next(withoutEntry(this.value, key, item));
	}

	// Implement Iterable.
	*[Symbol.iterator](): Generator<Entry<T>, void, undefined> {
		yield* Object.entries(this.value);
	}
}
