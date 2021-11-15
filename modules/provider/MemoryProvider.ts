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
	Transformer,
	isTransformer,
	transform,
} from "../util/index.js";
import { Transform } from "../transform/index.js";
import { ModelQuery, ModelDocument, DocumentRequiredError } from "../db/index.js";
import { Provider, SynchronousProvider } from "./Provider.js";

/**
 * Memory provider: fast in-memory store for data.
 *
 * This type of database is extremely fast (and ideal for caching!), but does not persist data after the browser window is closed.
 * `getDoc()` etc return the exact same instance of an object that's passed into `setDoc()` (as long as the set value is identified with an ID string prop).
 *
 * Equality hash is set on returned values so `deepEqual()` etc can use it to quickly compare results without needing to look deeply.
 */
export class MemoryProvider extends Provider implements SynchronousProvider {
	/** List of tables in `{ path: Table }` format. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private _tables: MutableObject<Table<any>> = {};

	// Get a named collection (or create a new one).
	private _table<X extends Data>({ collection }: ModelDocument<X> | ModelQuery<X>): Table<X> {
		return (this._tables[collection] ||= new Table<X>());
	}

	get<T extends Data>(ref: ModelDocument<T>): Result<T> {
		return this._table(ref).results[ref.id];
	}

	subscribe<T extends Data>(ref: ModelDocument<T>, observer: Observer<Result<T>>): Unsubscriber {
		const table = this._table(ref);
		const id = ref.id;

		// Call next() with initial results.
		dispatchNext(observer, table.results[id]);

		// Call next() every time the collection changes.
		return table.on(changes => {
			if (changes.includes(id)) dispatchNext(observer, table.results[id]);
		});
	}

	add<T extends Data>(ref: ModelQuery<T>, data: T): string {
		const table = this._table(ref);
		let id = randomId();
		while (table.results[id]) id = randomId(); // Regenerate ID until unique.
		table.write(id, data);
		return id;
	}

	write<T extends Data>(ref: ModelDocument<T>, value: T | Transformer<T> | undefined): void {
		const table = this._table(ref);
		const id = ref.id;
		if (isTransformer(value)) {
			const existing = table.results[id];
			if (!existing) throw new DocumentRequiredError(ref);
			table.write(id, transform(value, value));
		} else {
			table.write(id, value);
		}
	}

	getQuery<T extends Data>(ref: ModelQuery<T>): Results<T> {
		return ref.queryResults(this._table(ref).results);
	}

	subscribeQuery<T extends Data>(ref: ModelQuery<T>, observer: Observer<Results<T>>): Unsubscriber {
		const table = this._table(ref);
		const { filters, sorts, slice } = ref;
		let filtered = objectFromEntries(sorts.queryEntries(filters.queryEntries(Object.entries(table.results))));
		let sliced = slice.queryResults(filtered);

		// Call next() immediately with initial results.
		dispatchNext(observer, sliced);

		// Possibly call next() when the collection changes if the changes affect the subscription.
		return table.on(changes => {
			// Loop through changes and update `filtered` with any changed items.
			let updated = 0;
			let removed = 0;
			for (const id of changes) {
				const result = table.results[id];
				if (result && filters.match([id, result])) {
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

	writeQuery<T extends Data>(ref: ModelQuery<T>, value: T | Transformer<T> | undefined): void {
		const table = this._table(ref);
		const entries = ref.queryEntries(Object.entries(table.results));
		for (const [id, existing] of entries) table.write(id, value instanceof Transform ? value.transform(existing) : value);
	}

	/** Reset this provider and clear all data. */
	reset(): void {
		for (const table of Object.values(this._tables)) table.reset();
		this._tables = {};
	}
}

const UNDEFINED_PROMISE: Promise<void> = Promise.resolve(undefined);

/**
 * An individual table of data.
 * - Fires with an array of string IDs.
 */
class Table<T extends Data> {
	readonly results: MutableObject<T> = {};

	private _dispatchers: Dispatcher<ImmutableArray<string>>[] = [];
	private readonly _changes: MutableArray<string> = [];

	write(id: string, value: T | undefined): void {
		if (value !== this.results[id]) {
			if (value) this.results[id] = value;
			else delete this.results[id];

			// Queue `this.fire()` if we've created a change.
			if (!this._changes.length) thispatch<void, "fire">(this, "fire", UNDEFINED_PROMISE);
			addItem(this._changes, id);
		}
	}

	fire(): void {
		const changes = this._changes.splice(0);
		if (changes.length) for (const dispatcher of this._dispatchers) dispatch(dispatcher, changes);
	}

	on(dispatcher: Dispatcher<ImmutableArray<string>>): Unsubscriber {
		addItem(this._dispatchers, dispatcher);
		return this.off.bind(this, dispatcher);
	}

	off(dispatcher: Dispatcher<ImmutableArray<string>>): void {
		removeItem(this._dispatchers, dispatcher);
	}

	reset() {
		this._dispatchers = [];
	}
}
