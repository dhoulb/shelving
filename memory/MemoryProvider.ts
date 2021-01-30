/* eslint-disable require-await */

import type { Collection, Document, Provider } from "shelving/db";
import {
	randomId,
	Changes,
	Data,
	Result,
	Results,
	Entry,
	Change,
	MutableObject,
	objectFromEntries,
	Dispatcher,
	UnsubscribeDispatcher,
	deepMergeObject,
	createEvent,
	Event,
} from "shelving/tools";

/**
 * Fast in-memory database provider.
 *
 * This type of database is extremely fast (and ideal for caching!), but does not persist data after the browser window is closed.
 * `getDoc()` etc return the exact same instance of an object that's passed into `setDoc()` (as long as the set value is identified with an ID string prop).
 *
 * Equality hash is set on returned values so `deepEqual()` etc can use it to quickly compare results without needing to look deeply.
 */
export class MemoryProvider implements Provider {
	// Stored data indexed by string collection path and string ID.
	private _data: MutableObject<MutableObject<Data>> = {};

	// Set of Event instances (keyed by string collection path).
	// Each sub is fired with an array of changed items.
	private _subs: MutableObject<Event<string[]>> = {};

	/**
	 * Internal collection getter.
	 * Gets or creates the collection specified by `path`
	 */
	private _collection<T extends Data>(path: string) {
		return (path in this._data ? this._data[path] : (this._data[path] = {})) as MutableObject<T>;
	}

	/**
	 * Internal setter.
	 *
	 * @param path The collection path.
	 * @param id The document ID within the collection.
	 * @returns `true` if the document was updated and `false` if it wasn't (i.e. because the change didn't change anything).
	 */
	private _changeDocument<T extends Data>(path: string, id: string, change: Change<T> | undefined): boolean {
		const docs = this._collection<T>(path);
		if (!change) {
			// Delete the doc.
			if (docs[id]) {
				delete docs[id];
				return true;
			}
		} else {
			// Update the doc.
			const prev = docs[id]; // Might be undefined.
			if (prev) {
				const next = deepMergeObject(prev, change); // Diff against current value to avoid excess changes.
				if (next !== prev) {
					docs[id] = next;
					return true;
				}
			} else {
				docs[id] = change as T;
				return true;
			}
		}
		return false;
	}

	/** Generate a random unique ID for a collection. */
	private randomId(path: string): string {
		const collection = this._collection(path);
		let id = randomId();
		while (id in collection) id = randomId(); // Regenerate until unique.
		return id;
	}

	async getDocument<T extends Data>({ parent, id }: Document<T>): Promise<Result<T>> {
		return this._collection<T>(parent)[id];
	}

	onDocument<T extends Data>({ id, parent }: Document<T>, onNext: Dispatcher<Result<T>>): UnsubscribeDispatcher {
		const collection = this._collection<T>(parent);

		// Call onNext() with initial results (on next tick).
		onNext(collection[id]);

		// Call onNext() every time the collection changes.
		return (this._subs[parent] ||= createEvent<string[]>()).on(changes => {
			if (changes.includes(id)) onNext(collection[id]);
		});
	}

	async addDocument<T extends Data>({ path }: Collection<T>, data: T): Promise<Entry<T>> {
		const id = this.randomId(path);
		this._changeDocument(path, id, data);
		this._subs[path]?.fire([id]);
		return [id, data];
	}

	async mergeDocument<T extends Data>({ parent, id }: Document<T>, change: Change<T>): Promise<Change<T>> {
		const changed = this._changeDocument(parent, id, change);
		if (changed) this._subs[parent]?.fire([id]);
		return change;
	}

	async deleteDocument<T extends Data>({ parent, id }: Document<T>): Promise<void> {
		const changed = this._changeDocument(parent, id, undefined);
		if (changed) this._subs[parent]?.fire([id]);
	}

	async countCollection<T extends Data>({ path, query }: Collection<T>): Promise<number> {
		const collection = this._collection<T>(path);
		return query.count(collection);
	}

	async getCollection<T extends Data>({ path, query }: Collection<T>): Promise<Results<T>> {
		const collection = this._collection<T>(path);
		return query.results(collection);
	}

	onCollection<T extends Data>({ path, query }: Collection<T>, onNext: Dispatcher<Results<T>>): UnsubscribeDispatcher {
		const collection = this._collection<T>(path); // Entire collection.
		let filtered = objectFromEntries(query.sorts.apply(query.filters.apply(Object.entries(collection))));
		let last = query.slice.results(filtered);

		// Call onNext() with initial results (on next tick).
		void Promise.resolve(last).then(onNext);

		// Call onNext() when the collection changes.
		return (this._subs[path] ||= createEvent<string[]>()).on(async changes => {
			let updated = 0;
			let removed = 0;

			// Loop through changes and update `filtered` with any changed items.
			for (const id of changes) {
				const doc = collection[id];
				if (doc && query.match(id, doc)) {
					filtered[id] = doc; // Doc should be part of the filtered list.
					updated++;
				} else if (filtered[id]) {
					delete filtered[id]; // Doc shouldn't be part of the filtered list.
					removed++;
				}
			}

			// Skip calling onNext() if nothing changed.
			if (!updated && !removed) return;

			// Apply the sort.
			if (updated) {
				// Only sort if results were updated (skip sorting if only deletions happened).
				filtered = query.sorts.results(filtered);
			}

			// Apply the slice.
			let next = query.slice.results(filtered);
			if (next !== filtered) {
				// If a slice was applied all the changes might have happened _after_ the end of the limit slice.
				// So if every changed ID are not in `next` or `last`, there's no need to call `onNext()`
				if (changes.every(id => !last[id] && !next[id])) return;
			} else {
				// Make `next` a _copy_ and not the exact `filtered` instance (don't expose `filtered` to `onNext()` where it could be modified).
				next = { ...next };
			}

			// Call onNext() with the next result.
			onNext(next);

			// Iterate.
			last = next;
		});
	}

	async mergeCollection<T extends Data>({ path }: Collection<T>, changes: Changes<T>): Promise<Changes<T>> {
		let changed = false;
		const appliedChanges: { [id: string]: Change<T> | undefined } = {};
		for (const [id, change] of Object.entries(changes)) {
			if (this._changeDocument<T>(path, id, change)) {
				appliedChanges[id] = change;
				changed = true;
			}
		}
		if (changed) this._subs[path]?.fire(Object.keys(appliedChanges));
		return appliedChanges;
	}

	async reset(): Promise<void> {
		this._data = {};
		this._subs = {};
	}
}

/** Create a new MemoryProvider instance. */
export const provideMemory = (): MemoryProvider => new MemoryProvider();
