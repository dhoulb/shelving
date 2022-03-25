import { Data, Result, Entries, getRandomKey, Unsubscriber, dispatchNext, Observer, isMapEqual, MutableObject, Dispatcher, ImmutableMap, MutableMap } from "../util/index.js";
import { DataUpdate } from "../update/index.js";
import { DatabaseQuery, DatabaseDocument, DocumentRequiredError } from "../db/index.js";
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
	private _table<T extends Data>({ collection }: DatabaseDocument<T> | DatabaseQuery<T>): Table<T> {
		return (this._tables[collection] ||= new Table<T>()) as Table<T>;
	}

	get<T extends Data>(ref: DatabaseDocument<T>): Result<T> {
		return this._table(ref).data.get(ref.id) || null;
	}

	subscribe<T extends Data>(ref: DatabaseDocument<T>, observer: Observer<Result<T>>): Unsubscriber {
		const table = this._table(ref);
		const id = ref.id;

		// Call next() immediately with initial results.
		dispatchNext(observer, table.data.get(id) || null);

		// Call next() every time the collection changes.
		return table.on(changes => {
			changes.has(id) && dispatchNext(observer, changes.get(id) || null);
		});
	}

	add<T extends Data>(ref: DatabaseQuery<T>, data: T): string {
		const table = this._table(ref);
		let id = getRandomKey();
		while (table.data.get(id)) id = getRandomKey(); // Regenerate ID until unique.
		table.write(id, data);
		return id;
	}

	set<T extends Data>(ref: DatabaseDocument<T>, data: T): void {
		const table = this._table(ref);
		const id = ref.id;
		table.write(id, data);
	}

	update<T extends Data>(ref: DatabaseDocument<T>, updates: DataUpdate<T>): void {
		const table = this._table(ref);
		const id = ref.id;
		const existing = table.data.get(id);
		if (!existing) throw new DocumentRequiredError(ref);
		table.write(id, updates.transform(existing));
	}

	delete<T extends Data>(ref: DatabaseDocument<T>): void {
		const table = this._table(ref);
		const id = ref.id;
		table.write(id, null);
	}

	getQuery<T extends Data>(ref: DatabaseQuery<T>): Entries<T> {
		return ref.transform(this._table(ref).data);
	}

	subscribeQuery<T extends Data>(ref: DatabaseQuery<T>, observer: Observer<Entries<T>>): Unsubscriber {
		const table = this._table(ref);

		// Call `next()` immediately with the initial results.
		let lastResults = new Map(ref.transform(table.data));
		dispatchNext(observer, lastResults);

		// Possibly call `next()` when the collection changes if any changes affect the subscription.
		return table.on(changes => {
			for (const [id, next] of changes) {
				// Re-run the query if any change *might* affect the query:
				// 1) the last results included the changed document so it might need to be removed or updated.
				// 2) the next document matches the query so might be added to the next results.
				// Re-running the entire query is not the most efficient way to do this, but itis the most simple!
				if (lastResults.has(id) || (next && ref.match([id, next]))) {
					const nextResults = new Map(ref.transform(table.data));
					if (!isMapEqual(lastResults, nextResults)) {
						lastResults = nextResults;
						dispatchNext(observer, lastResults);
					}
					return;
				}
			}
		});
	}

	setQuery<T extends Data>(ref: DatabaseQuery<T>, data: T): number {
		const table = this._table(ref);
		// If there's a limit set: run the full query.
		// If there's no limit set: only need to run the filtering (more efficient because sort order doesn't matter).
		let count = 0;
		for (const [id] of ref.limit ? ref.transform(table.data) : ref.filters.transform(table.data)) {
			table.write(id, data);
			count++;
		}
		return count;
	}

	updateQuery<T extends Data>(ref: DatabaseQuery<T>, update: DataUpdate<T>): number {
		const table = this._table(ref);
		// If there's a limit set: run the full query.
		// If there's no limit set: only need to run the filtering (more efficient because sort order doesn't matter).
		let count = 0;
		for (const [id, existing] of ref.limit ? ref.transform(table.data) : ref.filters.transform(table.data)) {
			table.write(id, update.transform(existing));
			count++;
		}
		return count;
	}

	deleteQuery<T extends Data>(ref: DatabaseQuery<T>): number {
		const table = this._table(ref);
		// If there's a limit set: run the full query.
		// If there's no limit set: only need to run the filtering (more efficient because sort order doesn't matter).
		let count = 0;
		for (const [id] of ref.limit ? ref.transform(table.data) : ref.filters.transform(table.data)) {
			table.write(id, null);
			count++;
		}
		return count;
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
	on(listener: (changes: ImmutableMap<Result<T>>) => void): Unsubscriber;
	reset(): void;
}

type TableChanges<T extends Data> = ImmutableMap<Result<T>>;

/**
 * An individual table of data.
 * - Fires with an array of string IDs.
 */
class Table<T extends Data> implements AbstractTable<T> {
	readonly data: MutableMap<T> = new Map();
	readonly changes: MutableMap<Result<T>> = new Map();
	readonly listeners = new Set<Dispatcher<[TableChanges<T>]>>();
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
			for (const dispatcher of this.listeners) dispatcher(this.changes);
			this.changes.clear();
		}
	};
	on(listener: Dispatcher<[TableChanges<T>]>): Unsubscriber {
		this.listeners.add(listener);
		return this.off.bind(this, listener);
	}
	off(listener: Dispatcher<[TableChanges<T>]>): void {
		this.listeners.delete(listener);
	}
	reset() {
		this.data.clear();
		this.changes.clear();
		this.listeners.clear();
	}
}
