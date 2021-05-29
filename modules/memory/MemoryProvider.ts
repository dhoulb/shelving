import { Documents, Document, DocumentRequiredError, Provider } from "../db";
import { randomId } from "../random";
import type { Data, Result, Results } from "../data";
import { dispatch, Dispatcher, Unsubscriber } from "../function";
import { MutableObject, objectFromEntries, updateProps } from "../object";
import { addItem, ImmutableArray, MutableArray, removeItem } from "../array";
import { dispatchNext, Observer, State } from "../stream";
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

	currentDocument(ref: Document): State<Result> {
		return new State(this.getDocument(ref));
	}

	getDocument({ collection, id }: Document): Result {
		return this._table(collection).docs[id];
	}

	onDocument({ id, collection }: Document, observer: Observer<Result>): Unsubscriber {
		const table = this._table(collection);

		// Call next() with initial results.
		dispatchNext(observer, table.docs[id]);

		// Call next() every time the collection changes.
		return table.on(changed => {
			if (changed.includes(id)) dispatchNext(observer, table.docs[id]);
		});
	}

	addDocument({ path }: Documents, data: Data): string {
		const table = this._table(path);
		let id = randomId();
		while (table.docs[id]) id = randomId(); // Regenerate until unique.
		table.set(id, data);
		return id;
	}

	setDocument({ collection, id }: Document, data: Data): void {
		this._table(collection).set(id, data);
	}

	updateDocument(document: Document, partial: Data): void {
		const { collection, id } = document;
		const table = this._table(collection);
		const data = table.docs[id];
		if (!data) throw new DocumentRequiredError(document);
		table.set(id, updateProps(data, partial));
	}

	deleteDocument({ collection, id }: Document): void {
		this._table(collection).delete(id);
	}

	currentDocuments(ref: Documents): State<Results> {
		return new State(this.getDocuments(ref));
	}

	countDocuments({ path, query }: Documents): number {
		return query.count(Object.entries(this._table(path).docs));
	}

	getDocuments({ path, query }: Documents): Results {
		return query.results(this._table(path).docs);
	}

	onDocuments({ path, query }: Documents, observer: Observer<Results>): Unsubscriber {
		const table = this._table(path);
		let filtered = objectFromEntries(query.sorts.apply(query.filters.apply(Object.entries(table.docs))));
		let last = query.slice.results(filtered);

		// Call next() with initial results (on next tick).
		dispatchNext(observer, last);

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
			dispatchNext(observer, sliced);

			// Iterate.
			last = sliced;
		});
	}

	setDocuments({ path, query }: Documents, data: Data): void {
		const table = this._table(path);
		const entries = query.apply(Object.entries(table.docs));
		for (const [id] of entries) table.set(id, data);
	}

	updateDocuments({ path, query }: Documents, partial: Data): void {
		const table = this._table(path);
		const entries = query.apply(Object.entries(table.docs));
		for (const [id, data] of entries) table.set(id, updateProps(data, partial));
	}

	deleteDocuments({ path, query }: Documents): void {
		const table = this._table(path);
		const entries = query.apply(Object.entries(table.docs));
		for (const [id] of entries) table.delete(id);
	}

	reset(): void {
		this._data = {};
	}
}
