import type { MutableObject } from "../util/object.js";
import type { DocumentReference, QueryReference } from "../db/Reference.js";
import type { Data, Result } from "../util/data.js";
import { Observer, TransformObserver, Unsubscriber } from "../util/observe.js";
import { DataUpdate } from "../update/DataUpdate.js";
import { Entries } from "../util/entry.js";
import type { Provider, AsynchronousProvider } from "./Provider.js";
import { MemoryProvider } from "./MemoryProvider.js";
import { ThroughProvider } from "./ThroughProvider.js";

/** Keep a copy of received data in a local cache. */
export class CacheProvider extends ThroughProvider implements AsynchronousProvider {
	/** The local cache provider. */
	readonly cache: MemoryProvider;

	/** Last-known-correct time for data, indexed by key to power `getCachedAge()` etc. */
	private _times: MutableObject<number> = {};

	constructor(source: Provider, cache: MemoryProvider = new MemoryProvider()) {
		super(source);
		this.cache = cache;
	}

	/** Is a given document or query in the cache? */
	isCached<T extends Data>(ref: DocumentReference<T> | QueryReference<T>): boolean {
		const key = ref.toString();
		return typeof this._times[key] === "number";
	}

	/** Get the cache age for a given document or query reference. */
	getCachedAge<T extends Data>(ref: DocumentReference<T> | QueryReference<T>): number {
		const key = ref.toString();
		const time = this._times[key];
		return typeof time !== "number" ? Infinity : Date.now() - time;
	}

	/** Cache an individual document result. */
	private _cacheResult<T extends Data>(ref: DocumentReference<T>, result: Result<T>): Result<T> {
		result ? this.cache.set(ref, result) : this.cache.delete(ref);
		this._times[ref.toString()] = Date.now();
		return result;
	}

	// Override to cache any got result.
	override async get<T extends Data>(ref: DocumentReference<T>): Promise<Result<T>> {
		return this._cacheResult(ref, await super.get(ref));
	}

	// Override to cache any got results.
	override subscribe<T extends Data>(ref: DocumentReference<T>, observer: Observer<Result<T>>): Unsubscriber {
		return super.subscribe(ref, new TransformObserver(result => this._cacheResult(ref, result), observer));
	}

	override async add<T extends Data>(ref: QueryReference<T>, data: T): Promise<string> {
		const id = await super.add(ref, data);
		this.cache.set(ref.doc(id), data);
		return id;
	}

	override async set<T extends Data>(ref: DocumentReference<T>, data: T): Promise<void> {
		await super.set(ref, data);
		this.cache.set(ref, data);
	}

	override async update<T extends Data>(ref: DocumentReference<T>, update: DataUpdate<T>): Promise<void> {
		await super.update(ref, update);
		// Update the document in the cache if it exists using `updateDocuments()` and an `id` query.
		// Using `updateDocument()` would throw `RequiredError` if the document didn't exist.
		this.cache.updateQuery(ref.optional, update);
	}

	override async delete<T extends Data>(ref: DocumentReference<T>): Promise<void> {
		await super.delete(ref);
		this.cache.delete(ref);
	}

	/** Cache a set of document entries. */
	private *_cacheEntries<T extends Data>(ref: QueryReference<T>, entries: Entries<T>): Entries<T> {
		// We know the received set of results is the 'complete' set of results for this query.
		// So for correctness any documents matching this query that aren't in the new set of results should be deleted.
		// None of this applies if there's a query limit, because the document could have been moved to a different page so shouldn't be deleted.
		if (!ref.limit) for (const id of Object.keys(this.cache.getQuery(ref))) if (!(id in entries)) this.cache.delete(ref.doc(id));

		// Save new results to the cache.
		for (const [id, data] of entries) {
			this.cache.set(ref.doc(id), data);
			yield [id, data];
		}

		// Save the last-cached time.
		this._times[ref.toString()] = Date.now();
	}

	// Override to cache any got results.
	override async getQuery<T extends Data>(ref: QueryReference<T>): Promise<Entries<T>> {
		return this._cacheEntries(ref, await super.getQuery(ref));
	}

	// Override to cache any got results.
	override subscribeQuery<T extends Data>(ref: QueryReference<T>, observer: Observer<Entries<T>>): Unsubscriber {
		return super.subscribeQuery(ref, new TransformObserver(entries => this._cacheEntries(ref, entries), observer));
	}

	override async setQuery<T extends Data>(ref: QueryReference<T>, data: T): Promise<number> {
		const count = await super.setQuery(ref, data);
		this.cache.setQuery(ref, data);
		return count;
	}

	override async updateQuery<T extends Data>(ref: QueryReference<T>, update: DataUpdate<T>): Promise<number> {
		const count = await super.updateQuery(ref, update);
		this.cache.updateQuery(ref, update);
		return count;
	}

	override async deleteQuery<T extends Data>(ref: QueryReference<T>): Promise<number> {
		const count = await super.deleteQuery(ref);
		this.cache.deleteQuery(ref);
		return count;
	}

	/** Reset this provider and clear all data. */
	reset(): void {
		this.cache.reset();
		this._times = {};
	}
}
