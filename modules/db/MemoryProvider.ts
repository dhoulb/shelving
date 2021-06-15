import type { Data, Result, Results } from "../data";
import { randomId } from "../random";
import { dispatch, Dispatcher, Unsubscriber } from "../function";
import { MutableObject, objectFromEntries, updateProps } from "../object";
import { addItem, ImmutableArray, MutableArray, removeItem } from "../array";
import { dispatchNext, Observer, State } from "../stream";
import { logError } from "../console";
import type { Provider } from "./Provider";
import type { Documents } from "./Documents";
import type { Document } from "./Document";
import { DocumentRequiredError } from "./errors";

/**
 * Memory provider: fast in-memory store for data.
 *
 * This type of database is extremely fast (and ideal for caching!), but does not persist data after the browser window is closed.
 * `getDoc()` etc return the exact same instance of an object that's passed into `setDoc()` (as long as the set value is identified with an ID string prop).
 *
 * Equality hash is set on returned values so `deepEqual()` etc can use it to quickly compare results without needing to look deeply.
 */
export class MemoryProvider implements Provider {
	/** List of tables in `{ path: Table }` format. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	#data: MutableObject<Table<any>> = {};

	// Get a named collection (or create a new one).
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	#table(path: string): Table<any> {
		return (this.#data[path] ||= new Table());
	}

	currentDocument<T extends Data>(ref: Document<T>): State<Result<T>> {
		return new State(this.getDocument(ref));
	}

	getDocument<T extends Data>({ collection, id }: Document<T>): Result<T> {
		return this.#table(collection).docs[id];
	}

	onDocument<T extends Data>({ id, collection }: Document<T>, observer: Observer<Result<T>>): Unsubscriber {
		const table = this.#table(collection);

		// Call next() with initial results.
		dispatchNext(observer, table.docs[id]);

		// Call next() every time the collection changes.
		return table.on(changed => {
			if (changed.includes(id)) dispatchNext(observer, table.docs[id]);
		});
	}

	addDocument<T extends Data>({ path }: Documents<T>, data: T): string {
		const table = this.#table(path);
		let id = randomId();
		while (table.docs[id]) id = randomId(); // Regenerate until unique.
		table.set(id, data);
		return id;
	}

	setDocument<T extends Data>({ collection, id }: Document<T>, data: T): void {
		this.#table(collection).set(id, data);
	}

	updateDocument<T extends Data>(document: Document<T>, partial: Partial<T>): void {
		const { collection, id } = document;
		const table = this.#table(collection);
		const data = table.docs[id];
		if (!data) throw new DocumentRequiredError(document);
		table.set(id, updateProps(data, partial));
	}

	deleteDocument<T extends Data>({ collection, id }: Document<T>): void {
		this.#table(collection).delete(id);
	}

	currentDocuments<T extends Data>(ref: Documents<T>): State<Results<T>> {
		return new State(this.getDocuments(ref));
	}

	getDocuments<T extends Data>({ path, query }: Documents<T>): Results<T> {
		return query.results(this.#table(path).docs);
	}

	onDocuments<T extends Data>({ path, query }: Documents<T>, observer: Observer<Results<T>>): Unsubscriber {
		const table = this.#table(path);
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

	setDocuments<T extends Data>({ path, query }: Documents<T>, data: T): void {
		const table = this.#table(path);
		const entries = query.apply(Object.entries(table.docs));
		for (const [id] of entries) table.set(id, data);
	}

	updateDocuments<T extends Data>({ path, query }: Documents<T>, partial: Partial<T>): void {
		const table = this.#table(path);
		const entries = query.apply(Object.entries(table.docs));
		for (const [id, data] of entries) table.set(id, updateProps(data, partial));
	}

	deleteDocuments<T extends Data>({ path, query }: Documents<T>): void {
		const table = this.#table(path);
		const entries = query.apply(Object.entries(table.docs));
		for (const [id] of entries) table.delete(id);
	}

	reset(): void {
		this.#data = {};
	}
}

/**
 * An individual table of data.
 * - Fires with an array of string IDs.
 */
class Table<T extends Data> {
	readonly #dispatchers: Dispatcher<ImmutableArray<string>>[] = [];
	readonly #changes: MutableArray<string> = [];

	readonly docs: MutableObject<T> = {};

	set(id: string, data: T): void {
		if (data !== this.docs[id]) {
			this.docs[id] = data;
			this.#changed(id);
		}
	}

	delete(id: string): void {
		if (this.docs[id]) {
			delete this.docs[id];
			this.#changed(id);
		}
	}

	#changed(id: string) {
		if (!this.#changes.length) Promise.resolve().then(this.#dispatch, logError);
		addItem(this.#changes, id);
	}

	#dispatch = (): void => {
		if (this.#changes.length) {
			for (const dispatcher of this.#dispatchers) dispatch(dispatcher, this.#changes);
			this.#changes.splice(0);
		}
	};

	on(dispatcher: Dispatcher<ImmutableArray<string>>): Unsubscriber {
		addItem(this.#dispatchers, dispatcher);
		return () => removeItem(this.#dispatchers, dispatcher);
	}
}
