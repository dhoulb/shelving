import { setMapItem } from "../../util/map.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import { EndpointStore } from "./EndpointStore.js";

/** Serialize a payload to a stable string key for use in a `Map`. */
function _serializePayload(payload: unknown): string {
	if (payload === undefined) return "";
	return JSON.stringify(payload);
}

/**
 * Cache of `EndpointStore` objects for a single endpoint, keyed by serialized payload.
 * - Use `get(payload)` to retrieve or create the `EndpointStore` for a given payload.
 */
export class EndpointCache<P, R> implements Disposable {
	private readonly _endpoint: Endpoint<P, R>;
	private readonly _stores = new Map<string, EndpointStore<P, R>>();

	constructor(endpoint: Endpoint<P, R>) {
		this._endpoint = endpoint;
	}

	/** Get (or create) the `EndpointStore` for the given payload. */
	get(payload: P): EndpointStore<P, R> {
		const key = _serializePayload(payload);
		return this._stores.get(key) || setMapItem(this._stores, key, new EndpointStore(this._endpoint, payload));
	}

	/** Invalidate a specific store. */
	invalidate(payload: P): void {
		this.get(payload)?.invalidate();
	}

	/** Invalidate all stores. */
	invalidateAll(): void {
		for (const store of this._stores.values()) store.invalidate();
	}

	/** Trigger a refetch on a specific store. */
	refetch(payload: P): void {
		this.get(payload)?.fetch();
	}

	/** Trigger a refetch on all stores. */
	refetchAll(): void {
		for (const store of this._stores.values()) store.fetch();
	}

	// Implement Disposable.
	[Symbol.dispose](): void {
		for (const store of this._stores.values()) store[Symbol.dispose]();
		this._stores.clear();
	}
}
