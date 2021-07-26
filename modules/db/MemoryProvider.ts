import {
	Data,
	Result,
	Results,
	randomId,
	MutableObject,
	objectFromEntries,
	updateProps,
	addItem,
	ImmutableArray,
	MutableArray,
	removeItem,
	logError,
	dispatch,
	Dispatcher,
	Unsubscriber,
	dispatchNext,
	Observer,
} from "../util";
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
	#data: MutableObject<Table> = {};

	// Get a named collection (or create a new one).
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	#table(path: string): Table {
		return (this.#data[path] ||= new Table());
	}

	getDocument({ collection, id }: Document): Result {
		return this.#table(collection).docs[id];
	}

	onDocument({ id, collection }: Document, observer: Observer<Result>): Unsubscriber {
		const table = this.#table(collection);

		// Call next() with initial results.
		dispatchNext(observer, table.docs[id]);

		// Call next() every time the collection changes.
		return table.on(changed => {
			if (changed.includes(id)) dispatchNext(observer, table.docs[id]);
		});
	}

	addDocument({ path }: Documents, data: Data): string {
		const table = this.#table(path);
		let id = randomId();
		while (table.docs[id]) id = randomId(); // Regenerate until unique.
		table.set(id, data);
		return id;
	}

	setDocument({ collection, id }: Document, data: Data): void {
		this.#table(collection).set(id, data);
	}

	updateDocument(document: Document, data: Partial<Data>): void {
		const { collection, id } = document;
		const table = this.#table(collection);
		const existing = table.docs[id];
		if (!existing) throw new DocumentRequiredError(document);
		table.set(id, updateProps(existing, data));
	}

	deleteDocument({ collection, id }: Document): void {
		this.#table(collection).delete(id);
	}

	getDocuments({ path, query }: Documents): Results {
		return query.results(this.#table(path).docs);
	}

	onDocuments({ path, query }: Documents, observer: Observer<Results>): Unsubscriber {
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

	setDocuments({ path, query }: Documents, data: Data): void {
		const table = this.#table(path);
		const entries = query.apply(Object.entries(table.docs));
		for (const [id] of entries) table.set(id, data);
	}

	updateDocuments({ path, query }: Documents, data: Partial<Data>): void {
		const table = this.#table(path);
		const entries = query.apply(Object.entries(table.docs));
		for (const [id, existing] of entries) table.set(id, updateProps(existing, data));
	}

	deleteDocuments({ path, query }: Documents): void {
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
class Table {
	readonly #dispatchers: Dispatcher<ImmutableArray<string>>[] = [];
	readonly #changes: MutableArray<string> = [];

	readonly docs: MutableObject<Data> = {};

	set(id: string, data: Data): void {
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
