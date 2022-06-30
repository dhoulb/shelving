import type { DocumentReference, QueryReference } from "../db/Reference.js";
import type { MutableObject } from "../util/object.js";
import type { Data, Entity, Entities, OptionalEntity } from "../util/data.js";
import type { DataUpdate } from "../update/DataUpdate.js";
import type { Dispatch } from "../util/function.js";
import type { Unsubscribe } from "../observe/Observable.js";
import { getRandomKey } from "../util/random.js";
import { isArrayEqual } from "../util/equal.js";
import { transformProps } from "../util/transform.js";
import { Query } from "../query/Query.js";
import { RequiredError } from "../error/RequiredError.js";
import { Subject } from "../observe/Subject.js";
import { dispatchNext, PartialObserver } from "../observe/Observer.js";
import { getArray } from "../util/array.js";
import { Provider, SynchronousProvider } from "./Provider.js";

/**
 * Fast in-memory store for data.
 * - Extremely fast (ideal for caching!), but does not persist data after the browser window is closed.
 * - `get()` etc return the exact same instance of an object that's passed into `set()`
 */
export class MemoryProvider extends Provider implements SynchronousProvider {
	/** List of tables in `{ path: Table }` format. */
	private _tables: MutableObject<MemoryTable<any>> = {}; // eslint-disable-line @typescript-eslint/no-explicit-any

	// Get a named collection (or create a new one).
	getTable<T extends Data>({ collection }: DocumentReference<T> | QueryReference<T>): MemoryTable<T> {
		return (this._tables[collection] ||= new MemoryTable<T>()) as MemoryTable<T>;
	}

	getDocumentTime<T extends Data>(ref: DocumentReference<T>): number | undefined {
		return this.getTable(ref).getDocumentTime(ref.id);
	}

	getDocument<T extends Data>(ref: DocumentReference<T>): OptionalEntity<T> {
		return this.getTable(ref).getDocument(ref.id);
	}

	subscribeDocument<T extends Data>(ref: DocumentReference<T>, observer: PartialObserver<OptionalEntity<T>>): Unsubscribe {
		return this.getTable(ref).subscribeDocument(ref.id, observer);
	}

	addDocument<T extends Data>(ref: QueryReference<T>, data: T): string {
		return this.getTable(ref).addDocument(data);
	}

	setDocument<T extends Data>(ref: DocumentReference<T>, data: T): void {
		return this.getTable(ref).setDocument(ref.id, data);
	}

	updateDocument<T extends Data>(ref: DocumentReference<T>, update: DataUpdate<T>): void {
		return this.getTable(ref).updateDocument(ref.id, update);
	}

	deleteDocument<T extends Data>(ref: DocumentReference<T>): void {
		return this.getTable(ref).deleteDocument(ref.id);
	}

	getQueryTime<T extends Data>(ref: QueryReference<T>): number | undefined {
		return this.getTable(ref).getQueryTime(ref);
	}

	getQuery<T extends Data>(ref: QueryReference<T>): Entities<T> {
		return this.getTable(ref).getQuery(ref);
	}

	subscribeQuery<T extends Data>(ref: QueryReference<T>, observer: PartialObserver<Entities<T>>): Unsubscribe {
		return this.getTable(ref).subscribeQuery(ref, observer);
	}

	setQuery<T extends Data>(ref: QueryReference<T>, data: T): number {
		return this.getTable(ref).setQuery(ref, data);
	}

	updateQuery<T extends Data>(ref: QueryReference<T>, update: DataUpdate<T>): number {
		return this.getTable(ref).updateQuery(ref, update);
	}

	deleteQuery<T extends Data>(ref: QueryReference<T>): number {
		return this.getTable(ref).deleteQuery(ref);
	}
}

/**
 * An individual table of data.
 * - Fires with an array of string IDs.
 */
export class MemoryTable<T extends Data> extends Subject<void> {
	protected _data = new Map<string, Entity<T>>();
	protected _times = new Map<string, number>();
	protected _listeners = new Set<Dispatch>();
	protected _firing = false;

	getDocumentTime(id: string): number | undefined {
		return this._times.get(id);
	}

	getDocument(id: string): OptionalEntity<T> {
		return this._data.get(id) || null;
	}

	subscribeDocument(id: string, observer: PartialObserver<OptionalEntity<T>>): Unsubscribe {
		// Call next() immediately with initial results.
		let last = this.getDocument(id);
		dispatchNext(observer, last);

		// Call next() every time the collection changes.
		return this.subscribe(() => {
			const next = this.getDocument(id);
			if (next !== last) {
				last = next;
				dispatchNext(observer, last);
			}
		});
	}

	addDocument(data: T): string {
		let id = getRandomKey();
		while (this._data.has(id)) id = getRandomKey(); // Regenerate ID until unique.
		this.setEntity({ ...data, id });
		return id;
	}

	setEntity(entity: Entity<T>): void {
		const id = entity.id;
		this._data.set(id, entity);
		this._times.set(id, Date.now());
		this.next();
	}

	setDocument(id: string, data: T): void {
		this.setEntity({ ...data, id });
	}

	updateDocument(id: string, update: DataUpdate<T>): void {
		const entity = this._data.get(id);
		if (!entity) throw new RequiredError(`Document "${id}" does not exist`);
		this.setEntity({ ...entity, ...Object.fromEntries(transformProps(entity, update.updates)), id });
	}

	deleteDocument(id: string): void {
		this._data.delete(id);
		this._times.set(id, Date.now());
		this.next();
	}

	getQueryTime(query: Query<Entity<T>>): number | undefined {
		return this._times.get(_getQueryReference(query));
	}

	getQuery(query: Query<Entity<T>>): Entities<T> {
		return getArray(query.transform(this._data.values()));
	}

	subscribeQuery(query: Query<Entity<T>>, observer: PartialObserver<Entities<T>>): Unsubscribe {
		// Call `next()` immediately with the initial results.
		let last = this.getQuery(query);
		dispatchNext(observer, last);

		// Possibly call `next()` when the collection changes if any changes affect the subscription.
		return this.subscribe(() => {
			const next = this.getQuery(query);
			if (!isArrayEqual(last, next)) {
				last = next;
				dispatchNext(observer, last);
			}
		});
	}

	protected _getWrites(query: Query<Entity<T>>): Iterable<Entity<T>> {
		// Queries that have no limit don't care about sorting either.
		// So sorting can be skipped for performance.
		return query.limit ? query.transform(this._data.values()) : query.filters.transform(this._data.values());
	}

	setEntities(query: Query<Entity<T>>, entities: Entities<T>): number {
		const now = Date.now();
		let count = 0;
		for (const entity of entities) {
			const id = entity.id;
			this._data.set(id, entity);
			this._times.set(id, now);
			count++;
		}
		this._times.set(_getQueryReference(query), now);
		return count;
	}

	setQuery(query: Query<Entity<T>>, data: T): number {
		const now = Date.now();
		let count = 0;
		for (const { id } of this._getWrites(query)) {
			this._data.set(id, { ...data, id });
			this._times.set(id, now);
			count++;
		}
		this._times.set(_getQueryReference(query), now);
		this.next();
		return count;
	}

	updateQuery(query: Query<Entity<T>>, update: DataUpdate<T>): number {
		const now = Date.now();
		let count = 0;
		for (const entity of this._getWrites(query)) {
			const id = entity.id;
			this._data.set(id, { ...entity, ...Object.fromEntries(transformProps(entity, update.updates)), id });
			this._times.set(id, now);
			count++;
		}
		this._times.set(_getQueryReference(query), now);
		this.next();
		return count;
	}

	deleteQuery(query: Query<Entity<T>>): number {
		let count = 0;
		for (const { id } of this._getWrites(query)) {
			this._data.delete(id);
			this._times.set(id, Date.now());
			count++;
		}
		this._times.set(_getQueryReference(query), Date.now());
		this.next();
		return count;
	}
}

function _getQueryReference<T extends Data>(query: Query<Entity<T>>): string {
	// Queries that have no limit don't care about sorting either.
	return query.limit ? `filters=${query.filters.toString()}` : Query.prototype.toString.call(query);
}
