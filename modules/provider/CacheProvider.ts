import type { ModelDocument, ModelQuery } from "../db/index.js";
import { Data, Result, Results, Transforms, MutableObject, Unsubscriber, Observer } from "../util/index.js";
import { Stream } from "../stream/index.js";
import type { Provider, AsynchronousProvider } from "./Provider.js";
import { MemoryProvider } from "./MemoryProvider.js";
import { ThroughProvider } from "./ThroughProvider.js";

/**
 * Cache provider: keep a copy of received data in a local cache.
 */
export class CacheProvider extends ThroughProvider implements Provider, AsynchronousProvider {
	/** The local cache provider. */
	readonly cache: MemoryProvider;

	/** Last-known-correct time for data, indexed by key. */
	private _times: MutableObject<number> = {};

	constructor(source: Provider, cache: MemoryProvider = new MemoryProvider()) {
		super(source);
		this.cache = cache;
	}

	/** Is a given `Document` or `Document` reference in the cache? */
	isCached<X extends Data>(ref: ModelDocument<X> | ModelQuery<X>): boolean {
		const key = ref.toString();
		return typeof this._times[key] === "number";
	}

	/** Get the cache age for a given `Document` or `Documents` reference. */
	getCachedAge<X extends Data>(ref: ModelDocument<X> | ModelQuery<X>): number {
		const key = ref.toString();
		const time = this._times[key];
		return typeof time !== "number" ? Infinity : Date.now() - time;
	}

	/** Cache an individual document result. */
	private _cacheResult<X extends Data>(ref: ModelDocument<X>, result: Result<X>): void {
		// Set or delete the result in the cache.
		if (result) this.cache.set<X>(ref, result);
		else this.cache.delete<X>(ref);

		// Save the last-cached time.
		this._times[ref.toString()] = Date.now();
	}

	// Override to cache any got result.
	override async get<X extends Data>(ref: ModelDocument<X>): Promise<Result<X>> {
		const result = await super.get(ref);
		this._cacheResult(ref, result);
		return result;
	}

	// Override to cache any got results.
	override subscribe<X extends Data>(ref: ModelDocument<X>, observer: Observer<Result<X>>): Unsubscriber {
		const stream = new Stream<Result<X>>();
		stream.on({ next: r => this._cacheResult(ref, r) });
		stream.on(observer);
		return super.subscribe(ref, stream);
	}

	override async add<X extends Data>(ref: ModelQuery<X>, data: X): Promise<string> {
		const id = await super.add(ref, data);
		this.cache.set(ref.doc(id), data);
		return id;
	}

	override async set<X extends Data>(ref: ModelDocument<X>, data: X): Promise<void> {
		await super.set(ref, data);
		this.cache.set(ref, data);
	}

	override async update<X extends Data>(ref: ModelDocument<X>, transforms: Transforms<X>): Promise<void> {
		await super.update(ref, transforms);

		// Update the document in the cache if it exists using `updateDocuments()` and an `id` query.
		// Using `updateDocument()` would throw `RequiredError` if the document didn't exist.
		this.cache.updateQuery(ref.optional, transforms);
	}

	override async delete<X extends Data>(ref: ModelDocument<X>): Promise<void> {
		await super.delete(ref);
		this.cache.delete(ref);
	}

	/** Cache a set of document results. */
	private _cacheResults<X extends Data>(ref: ModelQuery<X>, results: Results<X>): void {
		// We know the received set of results is the 'complete' set of results for this query.
		// So for correctness any documents matching this query that aren't in the new set of results should be deleted.
		// None of this applies if there's a query limit, because the document could have been moved to a different page so shouldn't be deleted.
		if (!ref.slice.limit) for (const id of Object.keys(this.cache.getQuery(ref))) if (!(id in results)) this.cache.delete<X>(ref.doc(id));

		// Save the new results to the cache.
		for (const [id, data] of Object.entries(results)) this.cache.set<X>(ref.doc(id), data);

		// Save the last-cached time.
		this._times[ref.toString()] = Date.now();
	}

	// Override to cache any got results.
	override async getQuery<X extends Data>(ref: ModelQuery<X>): Promise<Results<X>> {
		const results = await super.getQuery(ref);
		this._cacheResults(ref, results);
		return results;
	}

	// Override to cache any got results.
	override subscribeQuery<X extends Data>(ref: ModelQuery<X>, observer: Observer<Results<X>>): Unsubscriber {
		const stream = new Stream<Results<X>>();
		stream.on({ next: r => this._cacheResults(ref, r) });
		stream.on(observer);
		return super.subscribeQuery(ref, stream);
	}

	override async setQuery<X extends Data>(ref: ModelQuery<X>, data: X): Promise<void> {
		await super.setQuery(ref, data);
		this.cache.setQuery(ref, data);
	}

	override async updateQuery<X extends Data>(ref: ModelQuery<X>, transforms: Transforms<X>): Promise<void> {
		await super.updateQuery(ref, transforms);
		this.cache.updateQuery(ref, transforms);
	}

	override async deleteQuery<X extends Data>(ref: ModelQuery<X>): Promise<void> {
		await super.deleteQuery(ref);
		this.cache.deleteQuery(ref);
	}

	/** Reset this provider and clear all data. */
	reset(): void {
		this.cache.reset();
		this._times = {};
	}
}
