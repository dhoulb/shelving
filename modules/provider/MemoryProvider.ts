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
import { ModelQuery, ModelDocument, DocumentRequiredError } from "../db/index.js";
import type { Provider, SynchronousProvider } from "./Provider.js";

/**
 * Memory provider: fast in-memory store for data.
 *
 * This type of database is extremely fast (and ideal for caching!), but does not persist data after the browser window is closed.
 * `getDoc()` etc return the exact same instance of an object that's passed into `setDoc()` (as long as the set value is identified with an ID string prop).
 *
 * Equality hash is set on returned values so `deepEqual()` etc can use it to quickly compare results without needing to look deeply.
 */
export class MemoryProvider implements Provider, SynchronousProvider {
	/** List of tables in `{ path: Table }` format. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private _tables: MutableObject<Table<any>> = {};

	// Get a named collection (or create a new one).
	private _table<X extends Data>({ collection }: ModelDocument<X> | ModelQuery<X>): Table<X> {
		return (this._tables[collection] ||= new Table());
	}

	get<X extends Data>(ref: ModelDocument<X>): Result<X> {
		return this._table<X>(ref).result(ref.id);
	}

	subscribe<X extends Data>(ref: ModelDocument<X>, observer: Observer<Result<X>>): Unsubscriber {
		const table = this._table(ref);
		const id = ref.id;

		// Call next() with initial results.
		dispatchNext(observer, table.results()[id]);

		// Call next() every time the collection changes.
		return table.on(changed => {
			if (changed.includes(id)) dispatchNext(observer, table.results()[id]);
		});
	}

	add<X extends Data>(ref: ModelQuery<X>, data: X): string {
		const table = this._table(ref);
		let id = randomId();
		while (table.result(id)) id = randomId(); // Regenerate ID until unique.
		table.write(id, data);
		return id;
	}

	set<X extends Data>(ref: ModelDocument<X>, data: X): void {
		this._table(ref).write(ref.id, data);
	}

	update<X extends Data>(ref: ModelDocument<X>, transforms: Transforms<X>): void {
		const table = this._table(ref);
		const id = ref.id;
		const existing = table.result(id);
		if (!existing) throw new DocumentRequiredError(ref);
		table.write(id, transformProps(existing, transforms));
	}

	delete<X extends Data>(ref: ModelDocument<X>): void {
		this._table(ref).write(ref.id, undefined);
	}

	getQuery<X extends Data>(ref: ModelQuery<X>): Results<X> {
		return ref.queryResults(this._table(ref).results());
	}

	subscribeQuery<X extends Data>(ref: ModelQuery<X>, observer: Observer<Results<X>>): Unsubscriber {
		const table = this._table(ref);
		const { filters, sorts, slice } = ref;
		let filtered = objectFromEntries(sorts.queryEntries(filters.queryEntries(Object.entries(table.results()))));
		let sliced = slice.queryResults(filtered);

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
			if (updated) filtered = sorts.queryResults(filtered);

			// Apply the slice.
			const newSliced = slice.queryResults(filtered);

			// If a slice was applied all the changes might have happened _after_ the end of the limit slice.
			// So if every changed ID are not in `next` or `last`, there's no need to call `next()`
			if (newSliced !== filtered && changes.every(id => !sliced[id] && !newSliced[id])) return;

			// Call next() with the next result.
			dispatchNext(observer, newSliced);

			// Iterate.
			sliced = newSliced;
		});
	}

	setQuery<X extends Data>(ref: ModelQuery<X>, data: X): void {
		const table = this._table(ref);
		const entries = ref.queryEntries(Object.entries(table.results()));
		for (const [id] of entries) table.write(id, data);
	}

	updateQuery<X extends Data>(ref: ModelQuery<X>, transforms: Transforms<X>): void {
		const table = this._table(ref);
		const entries = ref.queryEntries(Object.entries(table.results()));
		for (const [id, existing] of entries) table.write(id, transformProps(existing, transforms));
	}

	deleteQuery<X extends Data>(ref: ModelQuery<X>): void {
		const table = this._table(ref);
		const entries = ref.queryEntries(Object.entries(table.results()));
		for (const [id] of entries) table.write(id, undefined);
	}

	/** Reset this provider and clear all data. */
	reset(): void {
		this._tables = {};
	}
}

const UNDEFINED_PROMISE: Promise<void> = Promise.resolve(undefined);

/**
 * An individual table of data.
 * - Fires with an array of string IDs.
 */
class Table<X extends Data> {
	private readonly _dispatchers: Dispatcher<ImmutableArray<string>>[] = [];
	private readonly _changes: MutableArray<string> = [];
	private readonly _results: MutableObject<X> = {};

	results(): Results<X> {
		return this._results;
	}

	result(id: string): Result<X> {
		return this._results[id];
	}

	write(id: string, value: X | undefined): void {
		if (value !== this._results[id]) {
			if (value) this._results[id] = value as X;
			else delete this._results[id];
			if (!this._changes.length) thispatch<void, "fire">(this, "fire", UNDEFINED_PROMISE);
			addItem(this._changes, id);
		}
	}

	fire(): void {
		if (this._changes.length) {
			for (const dispatcher of this._dispatchers) dispatch(dispatcher, this._changes);
			this._changes.splice(0);
		}
	}

	on(dispatcher: Dispatcher<ImmutableArray<string>>): Unsubscriber {
		addItem(this._dispatchers, dispatcher);
		return () => removeItem(this._dispatchers, dispatcher);
	}
}
