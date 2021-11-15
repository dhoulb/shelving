import type { ModelDocument, ModelQuery } from "../db/index.js";
import { Transform } from "../transform/index.js";
import type { Data, Result, Results, MutableObject, Unsubscriber, Observer, Transformer } from "../util/index.js";
import { Stream } from "../stream/index.js";
import type { Provider, AsynchronousProvider } from "./Provider.js";
import { MemoryProvider } from "./MemoryProvider.js";
import { ThroughProvider } from "./ThroughProvider.js";

/** Keep a copy of received data in a local cache. */
export class CacheProvider extends ThroughProvider implements AsynchronousProvider {
	/** The local cache provider. */
	readonly cache: MemoryProvider;

	/** Last-known-correct time for data, indexed by key. */
	private _times: MutableObject<number> = {};

	constructor(source: Provider, cache: MemoryProvider = new MemoryProvider()) {
		super(source);
		this.cache = cache;
	}

	/** Is a given `Document` or `Document` reference in the cache? */
	isCached<T extends Data>(ref: ModelDocument<T> | ModelQuery<T>): boolean {
		const key = ref.toString();
		return typeof this._times[key] === "number";
	}

	/** Get the cache age for a given `Document` or `Documents` reference. */
	getCachedAge<T extends Data>(ref: ModelDocument<T> | ModelQuery<T>): number {
		const key = ref.toString();
		const time = this._times[key];
		return typeof time !== "number" ? Infinity : Date.now() - time;
	}

	/** Cache an individual document result. */
	private _cacheResult<T extends Data>(ref: ModelDocument<T>, result: Result<T>): void {
		// Set or delete the result in the cache.
		this.cache.write<T>(ref, result);

		// Save the last-cached time.
		this._times[ref.toString()] = Date.now();
	}

	// Override to cache any got result.
	override async get<T extends Data>(ref: ModelDocument<T>): Promise<Result<T>> {
		const result = await super.get(ref);
		this._cacheResult(ref, result);
		return result;
	}

	// Override to cache any got results.
	override subscribe<T extends Data>(ref: ModelDocument<T>, observer: Observer<Result<T>>): Unsubscriber {
		const stream = new Stream<Result<T>>();
		stream.on({ next: r => this._cacheResult(ref, r) });
		stream.on(observer);
		return super.subscribe(ref, stream);
	}

	override async add<T extends Data>(ref: ModelQuery<T>, data: T): Promise<string> {
		const id = await super.add(ref, data);
		this.cache.write(ref.doc(id), data);
		return id;
	}

	override async write<T extends Data>(ref: ModelDocument<T>, value: T | Transformer<T> | undefined): Promise<void> {
		await super.write(ref, value);

		// Update the document in the cache if it exists using `updateDocuments()` and an `id` query.
		// Using `updateDocument()` would throw `RequiredError` if the document didn't exist.
		if (value instanceof Transform) this.cache.writeQuery(ref.optional, value);
		else this.cache.write(ref, value);
	}

	/** Cache a set of document results. */
	private _cacheResults<T extends Data>(ref: ModelQuery<T>, results: Results<T>): void {
		// We know the received set of results is the 'complete' set of results for this query.
		// So for correctness any documents matching this query that aren't in the new set of results should be deleted.
		// None of this applies if there's a query limit, because the document could have been moved to a different page so shouldn't be deleted.
		if (!ref.slice.limit) for (const id of Object.keys(this.cache.getQuery(ref))) if (!(id in results)) this.cache.write<T>(ref.doc(id), undefined);

		// Save the new results to the cache.
		for (const [id, data] of Object.entries(results)) this.cache.write<T>(ref.doc(id), data);

		// Save the last-cached time.
		this._times[ref.toString()] = Date.now();
	}

	// Override to cache any got results.
	override async getQuery<T extends Data>(ref: ModelQuery<T>): Promise<Results<T>> {
		const results = await super.getQuery(ref);
		this._cacheResults(ref, results);
		return results;
	}

	// Override to cache any got results.
	override subscribeQuery<T extends Data>(ref: ModelQuery<T>, observer: Observer<Results<T>>): Unsubscriber {
		const stream = new Stream<Results<T>>();
		stream.on({ next: r => this._cacheResults(ref, r) });
		stream.on(observer);
		return super.subscribeQuery(ref, stream);
	}

	override async writeQuery<T extends Data>(ref: ModelQuery<T>, value: T | Transformer<T> | undefined): Promise<void> {
		await super.writeQuery(ref, value);
	}

	/** Reset this provider and clear all data. */
	reset(): void {
		this.cache.reset();
		this._times = {};
	}
}
