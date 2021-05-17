/* eslint-disable require-await */

import { Documents, Document, DocumentRequiredError, Provider } from "../db";
import { randomId } from "../random";
import type { Data, Result, Results } from "../data";
import { dispatch, Dispatcher, Unsubscriber } from "../function";
import { MutableObject, objectFromEntries, updateProps } from "../object";
import { addItem, ImmutableArray, MutableArray, removeItem } from "../array";
import { Stream } from "../stream";
import { logError } from "../console";

/**
 * An individual table of data.
 * - Fires with an array of string IDs.
 */
class Table {
	private readonly dispatchers: Dispatcher<ImmutableArray<string>>[] = [];
	private readonly changes: MutableArray<string> = [];

	readonly docs: MutableObject<Data> = {};

	set(id: string, data: Data): void {
		if (data !== this.docs[id]) {
			this.docs[id] = data;
			this._changed(id);
		}
	}

	delete(id: string): void {
		if (this.docs[id]) {
			delete this.docs[id];
			this._changed(id);
		}
	}

	private _changed(id: string) {
		if (!this.changes.length) Promise.resolve().then(this._dispatch, logError);
		addItem(this.changes, id);
	}

	private _dispatch = (): void => {
		if (this.changes.length) {
			for (const dispatcher of this.dispatchers) dispatch(dispatcher, this.changes);
			this.changes.splice(0);
		}
	};

	on(dispatcher: Dispatcher<ImmutableArray<string>>): Unsubscriber {
		addItem(this.dispatchers, dispatcher);
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
export class MemoryProvider implements Provider {
	/** Create a new MemoryProvider. */
	static create(): MemoryProvider {
		return new MemoryProvider();
	}

	// MemoryProvider doesn't need validation when results are got, because they were validated when saved and
	VALIDATE = false;

	// Empty so it can be protected.
	protected constructor() {
		//
	}

	// Registry of collections in `{ path: Table }` format.
	private _data: MutableObject<Table> = {};
	private _table(path: string): Table {
		return ((this._data[path] as Table) ||= new Table());
	}

	async getDocument({ collection, id }: Document): Promise<Result> {
		return this._table(collection).docs[id];
	}

	onDocument({ id, collection }: Document, stream: Stream<Result>): Unsubscriber {
		const table = this._table(collection);

		// Call next() with initial results.
		stream.next(table.docs[id]);

		// Call next() every time the collection changes.
		return table.on(changed => {
			if (changed.includes(id)) stream.next(table.docs[id]);
		});
	}

	async addDocument({ path }: Documents, data: Data): Promise<string> {
		const table = this._table(path);
		let id = randomId();
		while (table.docs[id]) id = randomId(); // Regenerate until unique.
		table.set(id, data);
		return id;
	}

	async setDocument({ collection, id }: Document, data: Data): Promise<void> {
		this._table(collection).set(id, data);
	}

	async updateDocument(document: Document, partial: Data): Promise<void> {
		const { collection, id } = document;
		const table = this._table(collection);
		const data = table.docs[id];
		if (!data) throw new DocumentRequiredError(document);
		table.set(id, updateProps(data, partial));
	}

	async deleteDocument({ collection, id }: Document): Promise<void> {
		this._table(collection).delete(id);
	}

	async countDocuments({ path, query }: Documents): Promise<number> {
		return query.count(Object.entries(this._table(path).docs));
	}

	async getDocuments({ path, query }: Documents): Promise<Results> {
		return query.results(this._table(path).docs);
	}

	onDocuments({ path, query }: Documents, stream: Stream<Results>): Unsubscriber {
		const table = this._table(path);
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
				if (doc && query.filters.match(id, doc)) {
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

	async setDocuments({ path, query }: Documents, data: Data): Promise<void> {
		const table = this._table(path);
		const entries = query.apply(Object.entries(table.docs));
		for (const [id] of entries) table.set(id, data);
	}

	async updateDocuments({ path, query }: Documents, partial: Data): Promise<void> {
		const table = this._table(path);
		const entries = query.apply(Object.entries(table.docs));
		for (const [id, data] of entries) table.set(id, updateProps(data, partial));
	}

	async deleteDocuments({ path, query }: Documents): Promise<void> {
		const table = this._table(path);
		const entries = query.apply(Object.entries(table.docs));
		for (const [id] of entries) table.delete(id);
	}

	async reset(): Promise<void> {
		this._data = {};
	}
}
