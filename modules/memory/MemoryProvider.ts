/* eslint-disable require-await */

import { Collection, Document, DocumentRequiredError, Provider } from "../db";
import { randomId } from "../random";
import type { Data, Result, Results } from "../data";
import { dispatch, Dispatcher, Unsubscriber } from "../function";
import { MutableObject, objectFromEntries, updateProps } from "../object";
import { addItem, ImmutableArray, MutableArray, removeItem } from "../array";
import { Stream } from "../stream";
import { logError } from "../console";

/**
 * An individual table of data.
 * - Fires with an array of strings.
 */
class Table<T extends Data> {
	private readonly dispatchers: Dispatcher<ImmutableArray<string>>[] = [];
	private readonly changes: MutableArray<string> = [];

	readonly docs: MutableObject<T> = {};

	set(id: string, data: T): void {
		if (data !== this.docs[id]) {
			this.docs[id] = data;
			addItem(this.changes, id);
			this.fire();
		}
	}

	delete(id: string): void {
		if (this.docs[id]) {
			delete this.docs[id];
			addItem(this.changes, id);
			this.fire();
		}
	}

	private fire() {
		Promise.resolve().then(this._fire, logError);
	}
	private _fire = (): void => {
		if (this.changes.length) {
			for (const dispatcher of this.dispatchers) dispatch(dispatcher, this.changes);
			this.changes.splice(0);
		}
	};

	on(dispatcher: Dispatcher<ImmutableArray<string>>): Unsubscriber {
		this.dispatchers.push(dispatcher);
		return () => removeItem(this.dispatchers, dispatcher);
	}
}

/**
 * Fast in-memory database provider.
 *
 * This type of database is extremely fast (and ideal for caching!), but does not persist data after the browser window is closed.
 * `getDoc()` etc return the exact same instance of an object that's passed into `setDoc()` (as long as the set value is identified with an ID string prop).
 *
 * Equality hash is set on returned values so `deepEqual()` etc can use it to quickly compare results without needing to look deeply.
 */
class MemoryProvider implements Provider {
	// Registry of collections in `{ path: Table<T> }` format.
	private data: MutableObject<Table<Data>> = {};
	table<X extends Data>(path: string): Table<X> {
		return ((this.data[path] as Table<X>) ||= new Table<X>());
	}

	async getDocument<T extends Data>({ parent, id }: Document<T>): Promise<Result<T>> {
		return this.table<T>(parent).docs[id];
	}

	onDocument<T extends Data>({ id, parent }: Document<T>, stream: Stream<Result<T>>): Unsubscriber {
		const table = this.table<T>(parent);

		// Call next() with initial results.
		stream.next(table.docs[id]);

		// Call next() every time the collection changes.
		return table.on(changed => {
			if (changed.includes(id)) stream.next(table.docs[id]);
		});
	}

	async addDocument<T extends Data>({ path }: Collection<T>, data: T): Promise<string> {
		const table = this.table<T>(path);
		let id = randomId();
		while (table.docs[id]) id = randomId(); // Regenerate until unique.
		table.set(id, data);
		return id;
	}

	async setDocument<T extends Data>({ parent, id }: Document<T>, data: T): Promise<void> {
		this.table<T>(parent).set(id, data);
	}

	async updateDocument<T extends Data>(document: Document<T>, updates: Partial<T>): Promise<void> {
		const { parent, id } = document;
		const table = this.table<T>(parent);
		const data = table.docs[id];
		if (data) {
			const merged = updateProps(data, updates);
			if (merged !== updates) table.set(id, merged);
		} else {
			throw new DocumentRequiredError(document);
		}
	}

	async deleteDocument<T extends Data>({ parent, id }: Document<T>): Promise<void> {
		this.table<T>(parent).delete(id);
	}

	async countCollection<T extends Data>({ path, query }: Collection<T>): Promise<number> {
		return query.count(this.table<T>(path).docs);
	}

	async getCollection<T extends Data>({ path, query }: Collection<T>): Promise<Results<T>> {
		return query.results(this.table<T>(path).docs);
	}

	onCollection<T extends Data>({ path, query }: Collection<T>, stream: Stream<Results<T>>): Unsubscriber {
		const table = this.table<T>(path);
		let filtered = objectFromEntries(query.sorts.apply(query.filters.apply(Object.entries(table.docs))));
		let last = query.slice.results(filtered);

		// Call next() with initial results (on next tick).
		stream.next(last);

		// Possibly call next() when the collection changes if the changes affect the subscription.
		return table.on(changes => {
			// Loop through changes and update `filtered` with any changed items.
			let updated = 0;
			let removed = 0;
			for (const id of changes) {
				const doc = table.docs[id];
				if (doc && query.match(id, doc)) {
					filtered[id] = doc; // Doc should be part of the filtered list.
					updated++;
				} else if (filtered[id]) {
					delete filtered[id]; // Doc shouldn't be part of the filtered list.
					removed++;
				}
			}

			// Nothing changed.
			if (!updated && !removed) return;

			// Updates they need to be sorted again.
			if (updated) filtered = query.sorts.results(filtered);

			// Apply the slice.
			const sliced = query.slice.results(filtered);

			// If a slice was applied all the changes might have happened _after_ the end of the limit slice.
			// So if every changed ID are not in `next` or `last`, there's no need to call `next()`
			if (sliced !== filtered && changes.every(id => !last[id] && !sliced[id])) return;

			// Call next() with the next result.
			stream.next(sliced);

			// Iterate.
			last = sliced;
		});
	}

	async reset(): Promise<void> {
		this.data = {};
	}
}

/** Create a new MemoryProvider instance. */
export const provideMemory = (): MemoryProvider => new MemoryProvider();
