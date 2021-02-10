/* eslint-disable require-await */

import { Collection, Document, DocumentRequiredError, Provider } from "../db";
import { randomId } from "../random";
import type { Data, Result, Results } from "../data";
import { Dispatcher, UnsubscribeDispatcher } from "../dispatch";
import { MutableObject, objectFromEntries, updateProps } from "../object";
import { addItem, ImmutableArray, MutableArray } from "../array";
import { Event } from "../event";
import { logError } from "../console";

/**
 * An individual table of data.
 * - Fires with an array of strings.
 */
class Table<T extends Data> extends Event<ImmutableArray<string>> {
	/** Actual data for this table. */
	readonly docs: MutableObject<T> = {};
	readonly changes: MutableArray<string> = [];

	setDoc(id: string, data: T): void {
		if (data !== this.docs[id]) {
			this.docs[id] = data;
			addItem(this.changes, id);
			this.fire();
		}
	}

	deleteDoc(id: string): void {
		if (this.docs[id]) {
			delete this.docs[id];
			addItem(this.changes, id);
			this.fire();
		}
	}

	fire() {
		Promise.resolve().then(this._fire, logError);
	}
	private _fire = (): void => {
		if (this.changes.length) {
			super.fire(this.changes);
			this.changes.splice(0);
		}
	};
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

	onDocument<T extends Data>({ id, parent }: Document<T>, onNext: Dispatcher<Result<T>>): UnsubscribeDispatcher {
		const table = this.table<T>(parent);

		// Call onNext() with initial results.
		onNext(table.docs[id]);

		// Call onNext() every time the collection changes.
		return table.on(changed => {
			if (changed.includes(id)) onNext(table.docs[id]);
		});
	}

	async addDocument<T extends Data>({ path }: Collection<T>, data: T): Promise<string> {
		const table = this.table<T>(path);
		let id = randomId();
		while (table.docs[id]) id = randomId(); // Regenerate until unique.
		table.setDoc(id, data);
		return id;
	}

	async setDocument<T extends Data>({ parent, id }: Document<T>, data: T): Promise<void> {
		this.table<T>(parent).setDoc(id, data);
	}

	async updateDocument<T extends Data>(document: Document<T>, updates: Partial<T>): Promise<void> {
		const { parent, id } = document;
		const table = this.table<T>(parent);
		const data = table.docs[id];
		if (data) {
			const merged = updateProps(data, updates);
			if (merged !== updates) table.setDoc(id, merged);
		} else {
			throw new DocumentRequiredError(document);
		}
	}

	async deleteDocument<T extends Data>({ parent, id }: Document<T>): Promise<void> {
		this.table<T>(parent).deleteDoc(id);
	}

	async countCollection<T extends Data>({ path, query }: Collection<T>): Promise<number> {
		return query.count(this.table<T>(path).docs);
	}

	async getCollection<T extends Data>({ path, query }: Collection<T>): Promise<Results<T>> {
		return query.results(this.table<T>(path).docs);
	}

	onCollection<T extends Data>({ path, query }: Collection<T>, onNext: Dispatcher<Results<T>>): UnsubscribeDispatcher {
		const table = this.table<T>(path);
		let filtered = objectFromEntries(query.sorts.apply(query.filters.apply(Object.entries(table.docs))));
		let last = query.slice.results(filtered);

		// Call onNext() with initial results (on next tick).
		void Promise.resolve(last).then(onNext);

		// Call onNext() when the collection changes.
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
			// So if every changed ID are not in `next` or `last`, there's no need to call `onNext()`
			if (sliced !== filtered && changes.every(id => !last[id] && !sliced[id])) return;

			// Call onNext() with the next result.
			onNext(sliced);

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
