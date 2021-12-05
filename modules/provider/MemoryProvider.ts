import { Data, Result, Results, randomId, dispatch, Dispatcher, Unsubscriber, dispatchNext, Observer, isMapEqual, MutableObject } from "../util/index.js";
import { Transform } from "../transform/index.js";
import { DataQuery, DataDocument, DocumentRequiredError } from "../db/index.js";
import { MutableMap } from "../util/map.js";
import { Provider, SynchronousProvider } from "./Provider.js";

/**
 * Fast in-memory store for data.
 * - Extremely fast (ideal for caching!), but does not persist data after the browser window is closed.
 * - `get()` etc return the exact same instance of an object that's passed into `set()`
 */
export class MemoryProvider extends Provider implements SynchronousProvider {
	/** List of tables in `{ path: Table }` format. */
	private _tables: MutableObject<Table<any>> = {}; // eslint-disable-line @typescript-eslint/no-explicit-any

	// Get a named collection (or create a new one).
	private _table<T extends Data>({ collection }: DataDocument<T> | DataQuery<T>): Table<T> {
		return (this._tables[collection] ||= new Table<T>()) as Table<T>;
	}

	get<T extends Data>(ref: DataDocument<T>): Result<T> {
		return this._table(ref).data.get(ref.id);
	}

	subscribe<T extends Data>(ref: DataDocument<T>, observer: Observer<Result<T>>): Unsubscriber {
		const table = this._table(ref);
		const id = ref.id;

		// Call next() immediately with initial results.
		dispatchNext(table.data.get(id), observer);

		// Call next() every time the collection changes.
		return table.on(changes => {
			changes.has(id) && dispatchNext(changes.get(id), observer);
		});
	}

	add<T extends Data>(ref: DataQuery<T>, data: T): string {
		const table = this._table(ref);
		let id = randomId();
		while (table.data.get(id)) id = randomId(); // Regenerate ID until unique.
		table.write(id, data);
		return id;
	}

	write<T extends Data>(ref: DataDocument<T>, value: T | Transform<T> | undefined): void {
		const table = this._table(ref);
		const id = ref.id;
		if (value instanceof Transform) {
			const existing = table.data.get(id);
			if (!existing) throw new DocumentRequiredError(ref);
			table.write(id, value.derive(existing));
		} else {
			table.write(id, value);
		}
	}

	getQuery<T extends Data>(ref: DataQuery<T>): Results<T> {
		return ref.derive(this._table(ref).data);
	}

	subscribeQuery<T extends Data>(ref: DataQuery<T>, observer: Observer<Results<T>>): Unsubscriber {
		const table = this._table(ref);

		// Call `next()` immediately with the initial results.
		let lastResults = new Map(ref.derive(table.data));
		dispatchNext(lastResults, observer);

		// Possibly call `next()` when the collection changes if any changes affect the subscription.
		return table.on(changes => {
			for (const [id, next] of changes) {
				// Re-run the query if any change *might* affect the query:
				// 1) the last results included the changed document so it might need to be removed or updated.
				// 2) the next document matches the query so might be added to the next results.
				// Re-running the entire query is not the most efficient way to do this, but itis the most simple!
				if (lastResults.has(id) || (next && ref.match([id, next]))) {
					const nextResults = new Map(ref.derive(table.data));
					if (!isMapEqual(lastResults, nextResults)) {
						lastResults = nextResults;
						dispatchNext(lastResults, observer);
					}
					return;
				}
			}
		});
	}

	writeQuery<T extends Data>(ref: DataQuery<T>, value: T | Transform<T> | undefined): void {
		const table = this._table(ref);
		// If there's a limit set: run the full query.
		// If there's no limit set: only need to run the filtering (more efficient because sort order doesn't matter).
		for (const [id, existing] of ref.limit ? ref.derive(table.data) : ref.filters.derive(table.data))
			table.write(id, value instanceof Transform ? value.derive(existing) : value);
	}

	/** Reset this provider and clear all data. */
	reset(): void {
		for (const table of Object.values(this._tables)) table?.reset();
	}
}

/** An abstract table of data. */
interface AbstractTable<T extends Data> {
	readonly data: MutableMap<T>;
	write(id: string, value: Result<T>): void;
	on(dispatcher: Dispatcher<MutableMap<Result<T>>>): Unsubscriber;
	reset(): void;
}

/**
 * An individual table of data.
 * - Fires with an array of string IDs.
 */
class Table<T extends Data> implements AbstractTable<T> {
	readonly data: MutableMap<T> = new Map();
	readonly changes: MutableMap<Result<T>> = new Map();
	readonly dispatchers: Set<Dispatcher<MutableMap<Result<T>>>> = new Set();
	write(id: string, value: Result<T>): void {
		if (value !== this.data.get(id)) {
			if (value) this.data.set(id, value);
			else this.data.delete(id);

			// Queue `this.fire()` if we've created a change.
			if (!this.changes.size) queueMicrotask(this.fire);
			this.changes.set(id, value);
		}
	}
	fire = () => {
		if (this.changes.size) {
			for (const dispatcher of this.dispatchers) dispatch(this.changes, dispatcher);
			this.changes.clear();
		}
	};
	on(dispatcher: Dispatcher<MutableMap<Result<T>>>): Unsubscriber {
		this.dispatchers.add(dispatcher);
		return this.off.bind(this, dispatcher);
	}
	off(dispatcher: Dispatcher<MutableMap<Result<T>>>): void {
		this.dispatchers.delete(dispatcher);
	}
	reset() {
		this.data.clear();
		this.changes.clear();
		this.dispatchers.clear();
	}
}
