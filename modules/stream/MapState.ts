import { countEntries, Entry, ImmutableObject, LOADING, Observable, Resolvable, withEntry, withoutEntry } from "../util/index.js";
import { State } from "./State.js";

/** State that stores a map-like object. */
export class MapState<T> extends State<ImmutableObject<T>> implements Iterable<Entry<T>> {
	/** Create a new MapState. */
	static override create<X>(initial: MapState<X> | Observable<ImmutableObject<X>> | Resolvable<ImmutableObject<X>> | typeof LOADING = {}): MapState<X> {
		return new MapState<X>(initial);
	}

	/** Count the number of entries in this map-like object. */
	get count(): number {
		return countEntries(this.value);
	}

	/** Count the number of results of this set of documents (asynchronously). */
	get asyncCount(): number | Promise<number> {
		return this.loading ? this.nextValue.then(countEntries) : countEntries(this.value);
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
