import {
	Data,
	Result,
	Results,
	randomId,
	MutableObject,
	objectFromEntries,
	addItem,
	ImmutableArray,
	MutableArray,
	removeItem,
	dispatch,
	Dispatcher,
	Unsubscriber,
	dispatchNext,
	Observer,
	thispatch,
	transformProps,
	Transforms,
} from "../util/index.js";
import type { Provider } from "./Provider.js";
import type { Documents } from "./Documents.js";
import type { Document } from "./Document.js";
import { ReferenceRequiredError } from "./errors.js";

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
	#tables: MutableObject<Table<any>> = {};

	// Get a named collection (or create a new one).
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	#table<X extends Data>({ collection }: Document<X> | Documents<X>): Table<X> {
		return (this.#tables[collection] ||= new Table());
	}

	getDocument<X extends Data>(ref: Document<X>): Result<X> {
		return this.#table<X>(ref).result(ref.id);
	}

	onDocument<X extends Data>(ref: Document<X>, observer: Observer<Result<X>>): Unsubscriber {
		const table = this.#table(ref);
		const id = ref.id;

		// Call next() with initial results.
		dispatchNext(observer, table.results()[id]);

		// Call next() every time the collection changes.
		return table.on(changed => {
			if (changed.includes(id)) dispatchNext(observer, table.results()[id]);
		});
	}

	addDocument<X extends Data>(ref: Documents<X>, data: X): string {
		const table = this.#table(ref);
		let id = randomId();
		while (table.result(id)) id = randomId(); // Regenerate ID until unique.
		table.set(id, data);
		return id;
	}

	setDocument<X extends Data>(ref: Document<X>, data: X): void {
		this.#table(ref).set(ref.id, data);
	}

	updateDocument<X extends Data>(ref: Document<X>, transforms: Transforms<X>): void {
		const table = this.#table(ref);
		const id = ref.id;
		const existing = table.result(id);
		if (!existing) throw new ReferenceRequiredError(ref);
		table.set(id, transformProps(existing, transforms));
	}

	deleteDocument<X extends Data>(ref: Document<X>): void {
		this.#table(ref).set(ref.id, undefined);
	}

	getDocuments<X extends Data>(ref: Documents<X>): Results<X> {
		return ref.query.results(this.#table(ref).results());
	}

	onDocuments<X extends Data>(ref: Documents<X>, observer: Observer<Results<X>>): Unsubscriber {
		const table = this.#table(ref);
		const { filters, sorts, slice } = ref.query;
		let filtered = objectFromEntries(sorts.apply(filters.apply(Object.entries(table.results()))));
		let sliced = slice.results(filtered);

		// Call next() with initial results (on next tick).
		dispatchNext(observer, sliced);

		// Possibly call next() when the collection changes if the changes affect the subscription.
		return table.on(changes => {
			// Loop through changes and update `filtered` with any changed items.
			let updated = 0;
			let removed = 0;
			for (const id of changes) {
				const result = table.result(id);
				if (result && filters.match(id, result)) {
					filtered[id] = result; // Doc should be part of the filtered list.
					updated++;
				} else if (filtered[id]) {
					delete filtered[id]; // Doc shouldn't be part of the filtered list.
					removed++;
				}
			}

			// Nothing changed.
			if (!updated && !removed) return;

			// Updates they need to be sorted again.
			if (updated) filtered = sorts.results(filtered);

			// Apply the slice.
			const newSliced = slice.results(filtered);

			// If a slice was applied all the changes might have happened _after_ the end of the limit slice.
			// So if every changed ID are not in `next` or `last`, there's no need to call `next()`
			if (newSliced !== filtered && changes.every(id => !sliced[id] && !newSliced[id])) return;

			// Call next() with the next result.
			dispatchNext(observer, newSliced);

			// Iterate.
			sliced = newSliced;
		});
	}

	setDocuments<X extends Data>(ref: Documents<X>, data: X): void {
		const table = this.#table(ref);
		const entries = ref.query.apply(Object.entries(table.results()));
		for (const [id] of entries) table.set(id, data);
	}

	updateDocuments<X extends Data>(ref: Documents<X>, transforms: Transforms<X>): void {
		const table = this.#table(ref);
		const entries = ref.query.apply(Object.entries(table.results()));
		for (const [id, existing] of entries) table.set(id, transformProps(existing, transforms));
	}

	deleteDocuments<X extends Data>(ref: Documents<X>): void {
		const table = this.#table(ref);
		const entries = ref.query.apply(Object.entries(table.results()));
		for (const [id] of entries) table.set(id, undefined);
	}

	reset(): void {
		this.#tables = {};
	}
}

const UNDEFINED_PROMISE: Promise<void> = Promise.resolve(undefined);

/**
 * An individual table of data.
 * - Fires with an array of string IDs.
 */
class Table<X extends Data> {
	readonly #dispatchers: Dispatcher<ImmutableArray<string>>[] = [];
	readonly #changes: MutableArray<string> = [];
	readonly #results: MutableObject<X> = {};

	results(): Results<X> {
		return this.#results;
	}

	result(id: string): Result<X> {
		return this.#results[id];
	}

	set(id: string, value: X | undefined): void {
		if (value !== this.#results[id]) {
			if (value) this.#results[id] = value as X;
			else delete this.#results[id];
			if (!this.#changes.length) thispatch<void, "fire">(this, "fire", UNDEFINED_PROMISE);
			addItem(this.#changes, id);
		}
	}

	fire(): void {
		if (this.#changes.length) {
			for (const dispatcher of this.#dispatchers) dispatch(dispatcher, this.#changes);
			this.#changes.splice(0);
		}
	}

	on(dispatcher: Dispatcher<ImmutableArray<string>>): Unsubscriber {
		addItem(this.#dispatchers, dispatcher);
		return () => removeItem(this.#dispatchers, dispatcher);
	}
}
