import type { DocumentReference, QueryReference } from "../db/Reference.js";
import type { MutableObject } from "../util/object.js";
import type { Data, Result, Entity } from "../util/data.js";
import type { DataUpdate } from "../update/DataUpdate.js";
import type { Dispatcher } from "../util/function.js";
import { dispatchNext, Observer, Unsubscriber } from "../util/observe.js";
import { getRandomKey } from "../util/random.js";
import { isArrayEqual } from "../util/equal.js";
import { ReferenceRequiredError } from "../db/errors.js";
import { transformProps } from "../util/transform.js";
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
	table<T extends Data>({ collection }: DocumentReference<T> | QueryReference<T>): Table<T> {
		return (this._tables[collection] ||= new Table<T>()) as Table<T>;
	}

	get<T extends Data>(ref: DocumentReference<T>): Result<Entity<T>> {
		return this.table(ref).get(ref.id);
	}

	subscribe<T extends Data>(ref: DocumentReference<T>, observer: Observer<Result<Entity<T>>>): Unsubscriber {
		const table = this.table(ref);
		const id = ref.id;

		// Call next() immediately with initial results.
		dispatchNext(observer, table.get(id));

		// Call next() every time the collection changes.
		return table.on(changes => {
			changes.has(id) && dispatchNext(observer, table.get(id));
		});
	}

	add<T extends Data>(ref: QueryReference<T>, data: T): string {
		const table = this.table(ref);
		let id = getRandomKey();
		while (table.get(id)) id = getRandomKey(); // Regenerate ID until unique.
		table.set({ ...data, id });
		return id;
	}

	set<T extends Data>(ref: DocumentReference<T>, data: T): void {
		const table = this.table(ref);
		const id = ref.id;
		table.set({ ...data, id });
	}

	update<T extends Data>(ref: DocumentReference<T>, update: DataUpdate<T>): void {
		const table = this.table(ref);
		const id = ref.id;
		const entity = table.get(id);
		if (!entity) throw new ReferenceRequiredError(ref);
		table.set({ ...entity, ...Object.fromEntries(transformProps(entity, update.updates)), id: entity.id });
	}

	delete<T extends Data>(ref: DocumentReference<T>): void {
		const table = this.table(ref);
		const id = ref.id;
		table.delete(id);
	}

	getQuery<T extends Data>(ref: QueryReference<T>): Iterable<Entity<T>> {
		return ref.transform(this.table(ref).entities);
	}

	subscribeQuery<T extends Data>(ref: QueryReference<T>, observer: Observer<Iterable<Entity<T>>>): Unsubscriber {
		const table = this.table(ref);

		// Call `next()` immediately with the initial results.
		let last = Array.from(ref.transform(table.entities));
		dispatchNext(observer, last);

		// Possibly call `next()` when the collection changes if any changes affect the subscription.
		return table.on(() => {
			const next = Array.from(ref.transform(table.entities));
			if (!isArrayEqual(last, next)) {
				last = next;
				dispatchNext(observer, last);
			}
		});
	}

	setQuery<T extends Data>(ref: QueryReference<T>, data: T): number {
		const table = this.table(ref);
		// If there's a limit set: run the full query.
		// If there's no limit set: only need to run the filtering (more efficient because sort order doesn't matter).
		let count = 0;
		for (const { id } of ref.limit ? ref.transform(table.entities) : ref.filters.transform(table.entities)) {
			table.set({ ...data, id });
			count++;
		}
		return count;
	}

	updateQuery<T extends Data>(ref: QueryReference<T>, update: DataUpdate<T>): number {
		const table = this.table(ref);
		// If there's a limit set: run the full query.
		// If there's no limit set: only need to run the filtering (more efficient because sort order doesn't matter).
		let count = 0;
		for (const entity of ref.limit ? ref.transform(table.entities) : ref.filters.transform(table.entities)) {
			table.set({ ...entity, ...Object.fromEntries(transformProps(entity, update.updates)), id: entity.id });
			count++;
		}
		return count;
	}

	deleteQuery<T extends Data>(ref: QueryReference<T>): number {
		const table = this.table(ref);
		// If there's a limit set: run the full query.
		// If there's no limit set: only need to run the filtering (more efficient because sort order doesn't matter).
		let count = 0;
		for (const { id } of ref.limit ? ref.transform(table.entities) : ref.filters.transform(table.entities)) {
			table.delete(id);
			count++;
		}
		return count;
	}
}

/**
 * An individual table of data.
 * - Fires with an array of string IDs.
 */
class Table<T extends Data> {
	protected data = new Map<string, Entity<T>>();
	protected changes = new Set<string>();
	protected listeners = new Set<Dispatcher<[Set<string>]>>();
	get(id: string): Result<Entity<T>> {
		return this.data.get(id) || null;
	}
	get entities(): Iterable<Entity<T>> {
		return this.data.values();
	}
	set(entity: Entity<T>): void {
		if (entity !== this.get(entity.id)) {
			this.data.set(entity.id, entity);

			// Queue `this.fire()` if we've created a change.
			if (!this.changes.size) queueMicrotask(this.fire);
			this.changes.add(entity.id);
		}
	}
	delete(id: string): void {
		if (this.data.has(id)) {
			this.data.delete(id);

			// Queue `this.fire()` if we've created a change.
			if (!this.changes.size) queueMicrotask(this.fire);
			this.changes.add(id);
		}
	}
	fire = () => {
		if (this.changes.size) {
			for (const dispatcher of this.listeners) dispatcher(this.changes);
			this.changes.clear();
		}
	};
	on(listener: Dispatcher<[Set<string>]>): Unsubscriber {
		this.listeners.add(listener);
		return this.off.bind(this, listener);
	}
	off(listener: Dispatcher<[Set<string>]>): void {
		this.listeners.delete(listener);
	}
}
