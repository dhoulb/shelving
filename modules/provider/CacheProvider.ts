import type { DatabaseDocument, DatabaseQuery } from "../db/index.js";
import { Transform } from "../transform/index.js";
import { Result, MutableObject, Unsubscriber, Observer, Datas, Key, Results, DeriveObserver } from "../util/index.js";
import type { Provider, AsynchronousProvider } from "./Provider.js";
import { MemoryProvider } from "./MemoryProvider.js";
import { ThroughProvider } from "./ThroughProvider.js";

/** Keep a copy of received data in a local cache. */
export class CacheProvider<D extends Datas> extends ThroughProvider<D> implements AsynchronousProvider<D> {
	/** The local cache provider. */
	readonly cache: MemoryProvider<D>;

	/** Last-known-correct time for data, indexed by key to power `getCachedAge()` etc. */
	private _times: MutableObject<number> = {};

	constructor(source: Provider<D>, cache: MemoryProvider<D> = new MemoryProvider()) {
		super(source);
		this.cache = cache;
	}

	/** Is a given document or query in the cache? */
	isCached<C extends Key<D>>(ref: DatabaseDocument<D, C> | DatabaseQuery<D, C>): boolean {
		const key = ref.toString();
		return typeof this._times[key] === "number";
	}

	/** Get the cache age for a given document or query reference. */
	getCachedAge<C extends Key<D>>(ref: DatabaseDocument<D, C> | DatabaseQuery<D, C>): number {
		const key = ref.toString();
		const time = this._times[key];
		return typeof time !== "number" ? Infinity : Date.now() - time;
	}

	/** Cache an individual document result. */
	private _cacheResult<C extends Key<D>>(ref: DatabaseDocument<D, C>, result: Result<D[C]>): Result<D[C]> {
		this.cache.write(ref, result);
		this._times[ref.toString()] = Date.now();
		return result;
	}

	// Override to cache any got result.
	override async get<C extends Key<D>>(ref: DatabaseDocument<D, C>): Promise<Result<D[C]>> {
		return this._cacheResult(ref, await super.get(ref));
	}

	// Override to cache any got results.
	override subscribe<C extends Key<D>>(ref: DatabaseDocument<D, C>, observer: Observer<Result<D[C]>>): Unsubscriber {
		return super.subscribe(ref, new DeriveObserver(result => this._cacheResult(ref, result), observer));
	}

	override async add<C extends Key<D>>(ref: DatabaseQuery<D, C>, data: D[C]): Promise<string> {
		const id = await super.add(ref, data);
		this.cache.write(ref.doc(id), data);
		return id;
	}

	override async write<C extends Key<D>>(ref: DatabaseDocument<D, C>, value: D[C] | Transform<D[C]> | undefined): Promise<void> {
		await super.write(ref, value);

		// Update the document in the cache if it exists using `updateDocuments()` and an `id` query.
		// Using `updateDocument()` would throw `RequiredError` if the document didn't exist.
		if (value instanceof Transform) this.cache.writeQuery(ref.optional, value);
		else this.cache.write(ref, value);
	}

	/** Cache a set of document results. */
	private *_cacheResults<C extends Key<D>>(ref: DatabaseQuery<D, C>, results: Results<D[C]>): Results<D[C]> {
		// We know the received set of results is the 'complete' set of results for this query.
		// So for correctness any documents matching this query that aren't in the new set of results should be deleted.
		// None of this applies if there's a query limit, because the document could have been moved to a different page so shouldn't be deleted.
		if (!ref.limit) for (const id of Object.keys(this.cache.getQuery(ref))) if (!(id in results)) this.cache.write(ref.doc(id), undefined);

		// Save new results to the cache.
		for (const [id, data] of results) {
			this.cache.write(ref.doc(id), data);
			yield [id, data];
		}

		// Save the last-cached time.
		this._times[ref.toString()] = Date.now();
	}

	// Override to cache any got results.
	override async getQuery<C extends Key<D>>(ref: DatabaseQuery<D, C>): Promise<Results<D[C]>> {
		return this._cacheResults(ref, await super.getQuery(ref));
	}

	// Override to cache any got results.
	override subscribeQuery<C extends Key<D>>(ref: DatabaseQuery<D, C>, observer: Observer<Results<D[C]>>): Unsubscriber {
		return super.subscribeQuery(ref, new DeriveObserver(results => this._cacheResults(ref, results), observer));
	}

	override async writeQuery<C extends Key<D>>(ref: DatabaseQuery<D, C>, value: D[C] | Transform<D[C]> | undefined): Promise<void> {
		await super.writeQuery(ref, value);
		this.cache.writeQuery(ref, value);
	}

	/** Reset this provider and clear all data. */
	reset(): void {
		this.cache.reset();
		this._times = {};
	}
}
