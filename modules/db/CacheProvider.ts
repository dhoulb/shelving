import { Data, Result, Results, Transforms, MutableObject, Unsubscriber, Observer } from "../util/index.js";
import { Stream } from "../index.js";
import type { Document } from "./Document.js";
import type { Documents } from "./Documents.js";
import type { Provider, AsynchronousProvider } from "./Provider.js";
import { MemoryProvider } from "./MemoryProvider.js";
import { ThroughProvider } from "./ThroughProvider.js";

/**
 * Cache provider: keep a copy of received data in a local cache.
 */
export class CacheProvider extends ThroughProvider implements Provider {
	/** The local cache provider. */
	readonly cache: MemoryProvider;

	/** Last-known-correct time for data, indexed by key. */
	private _times: MutableObject<number> = {};

	constructor(source: AsynchronousProvider, cache: MemoryProvider = new MemoryProvider()) {
		super(source);
		this.cache = cache;
	}

	/** Is a given `Document` or `Document` reference in the cache? */
	isCached<X extends Data>(ref: Document<X> | Documents<X>): boolean {
		const key = ref.toString();
		return typeof this._times[key] === "number";
	}

	/** Get the cache age for a given `Document` or `Documents` reference. */
	getCachedAge<X extends Data>(ref: Document<X> | Documents<X>): number {
		const key = ref.toString();
		const time = this._times[key];
		return typeof time !== "number" ? Infinity : Date.now() - time;
	}

	/** Cache an individual document result. */
	private _cacheResult<X extends Data>(ref: Document<X>, result: Result<X>): void {
		// Set or delete the result in the cache.
		if (result) this.cache.setDocument<X>(ref, result);
		else this.cache.deleteDocument<X>(ref);

		// Save the last-cached time.
		this._times[ref.toString()] = Date.now();
	}

	// Override to cache any got result.
	override async getDocument<X extends Data>(ref: Document<X>): Promise<Result<X>> {
		const result = await super.getDocument(ref);
		this._cacheResult(ref, result);
		return result;
	}

	// Override to cache any got results.
	override onDocument<X extends Data>(ref: Document<X>, observer: Observer<Result<X>>): Unsubscriber {
		const stream = new Stream<Result<X>>();
		stream.on({ next: r => this._cacheResult(ref, r) });
		stream.on(observer);
		return super.onDocument(ref, stream);
	}

	override async addDocument<X extends Data>(ref: Documents<X>, data: X): Promise<string> {
		const id = await super.addDocument(ref, data);
		this.cache.setDocument(ref.doc(id), data);
		return id;
	}

	override async setDocument<X extends Data>(ref: Document<X>, data: X): Promise<void> {
		await super.setDocument(ref, data);
		this.cache.setDocument(ref, data);
	}

	override async updateDocument<X extends Data>(ref: Document<X>, transforms: Transforms<X>): Promise<void> {
		await super.updateDocument(ref, transforms);

		// Update the document in the cache if it exists using `updateDocuments()` and an `id` query.
		// Using `updateDocument()` would throw `RequiredError` if the document didn't exist.
		this.cache.updateDocuments(ref.db.docs(ref.collection).is("id", ref.id), transforms);
	}

	override async deleteDocument<X extends Data>(ref: Document<X>): Promise<void> {
		await super.deleteDocument(ref);
		this.cache.deleteDocument(ref);
	}

	/** Cache a set of document results. */
	private _cacheResults<X extends Data>(ref: Documents<X>, results: Results<X>): void {
		// We know the received set of results is the 'complete' set of results for this query.
		// So for correctness any documents matching this query that aren't in the new set of results should be deleted.
		// None of this applies if there's a query limit, because the document could have been moved to a different page so shouldn't be deleted.
		if (!ref.query.slice.limit) for (const id of Object.keys(this.cache.getDocuments(ref))) if (!(id in results)) this.cache.deleteDocument<X>(ref.doc(id));

		// Save the new results to the cache.
		for (const [id, data] of Object.entries(results)) this.cache.setDocument<X>(ref.doc(id), data);

		// Save the last-cached time.
		this._times[ref.toString()] = Date.now();
	}

	// Override to cache any got results.
	override async getDocuments<X extends Data>(ref: Documents<X>): Promise<Results<X>> {
		const results = await super.getDocuments(ref);
		this._cacheResults(ref, results);
		return results;
	}

	// Override to cache any got results.
	override onDocuments<X extends Data>(ref: Documents<X>, observer: Observer<Results<X>>): Unsubscriber {
		const stream = new Stream<Results<X>>();
		stream.on({ next: r => this._cacheResults(ref, r) });
		stream.on(observer);
		return super.onDocuments(ref, stream);
	}

	override async setDocuments<X extends Data>(ref: Documents<X>, data: X): Promise<void> {
		await super.setDocuments(ref, data);
		this.cache.setDocuments(ref, data);
	}

	override async updateDocuments<X extends Data>(ref: Documents<X>, transforms: Transforms<X>): Promise<void> {
		await super.updateDocuments(ref, transforms);
		this.cache.updateDocuments(ref, transforms);
	}

	override async deleteDocuments<X extends Data>(ref: Documents<X>): Promise<void> {
		await super.deleteDocuments(ref);
		this.cache.deleteDocuments(ref);
	}

	/** Reset this provider and clear all data. */
	reset(): void {
		this.cache.reset();
		this._times = {};
	}
}
