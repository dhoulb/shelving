import { awaitValues } from "../../util/async.js";
import { awaitDispose } from "../../util/dispose.js";
import type { AnyCaller } from "../../util/function.js";
import { setMapItem } from "../../util/map.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import type { APIProvider } from "../provider/APIProvider.js";
import { EndpointStore } from "../store/EndpointStore.js";

/**
 * Cache of `EndpointStore` objects for a single endpoint, keyed by serialized payload.
 * - Use `get(payload)` to retrieve or create the `EndpointStore` for a given payload.
 */
export class EndpointCache<P = unknown, R = unknown> implements AsyncDisposable {
	private readonly _endpoints = new Map<string, EndpointStore<P, R>>();

	readonly endpoint: Endpoint<P, R>;
	readonly provider: APIProvider<P, R>;

	constructor(endpoint: Endpoint<P, R>, provider: APIProvider<P, R>) {
		this.endpoint = endpoint;
		this.provider = provider;
	}

	/** Get (or create) the `EndpointStore` for the given payload. */
	get(payload: P, caller: AnyCaller = this.get): EndpointStore<P, R> {
		const url = this.provider.renderURL(this.endpoint, payload, caller).href;
		return this._endpoints.get(url) || setMapItem(this._endpoints, url, new EndpointStore(this.endpoint, payload, this.provider));
	}

	/** Invalidate a specific store. */
	invalidate(payload: P, caller: AnyCaller = this.invalidate): void {
		this.get(payload, caller)?.invalidate();
	}

	/** Invalidate all stores. */
	invalidateAll(): void {
		for (const store of this._endpoints.values()) store.invalidate();
	}

	/** Trigger a refetch on a specific store. */
	async refresh(payload: P, caller: AnyCaller = this.invalidate): Promise<void> {
		await this.get(payload, caller)?.refresh();
	}

	/** Trigger a refetch on all stores. */
	async refreshAll(): Promise<void> {
		await awaitValues(...this._endpoints.values().map(store => store.refresh()));
	}

	// Implement `AsyncDisposable`
	[Symbol.asyncDispose](): Promise<void> {
		return awaitDispose(
			...this._endpoints.values(), // Dispose all endpoints.
			() => this._endpoints.clear(), // Clear the endpoints.
		);
	}
}
