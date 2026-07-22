import { UnsupportedError } from "../../error/UnsupportedError.js";
import { StringSchema } from "../../schema/StringSchema.js";
import type { Data } from "../../util/data.js";
import { isData } from "../../util/data.js";
import type { Identifier, Item } from "../../util/item.js";
import type { Collection } from "../collection/Collection.js";
import { MemoryDBProvider, MemoryTable } from "./MemoryDBProvider.js";

/** Options for `LocalStorageProvider`. */
export interface LocalStorageProviderOptions {
	/** Prefix for every storage key written by this provider, so it can share an origin's storage with other code (defaults to `"shelving:"`). */
	readonly prefix?: string;
	/** `Storage` instance to persist to, e.g. `sessionStorage` or a test double (defaults to `globalThis.localStorage`). */
	readonly storage?: Storage;
}

/**
 * In-memory database provider that persists every collection to `localStorage` (or any other `Storage`).
 *
 * - Extends `MemoryDBProvider`, so all reads, queries, and realtime sequences are served synchronously from memory, and it can seed `ItemStore` / `QueryStore` and act as the cache inside `CacheDBProvider`.
 * - Each collection is hydrated from storage once, lazily, on first access; after that every write persists to storage *before* it is applied to memory, so a failed write (e.g. `QuotaExceededError` when the origin's quota is full) throws and leaves memory and storage consistent.
 * - Items are stored as JSON under keys formatted as `{prefix}{collection}:{id}`, so values must be JSON-serializable.
 * - Listens for `storage` events, so changes made in other tabs/windows update memory and notify realtime sequences.
 * - Treat the persisted data as best-effort: quota is shared across the origin (typically ~5MB) and users can clear it at any time. Data read back from storage is unvalidated — wrap this provider in `ValidationDBProvider` if it may have been written by an older version of your app.
 *
 * ### Environment support
 * - **No `localStorage` at all** (Node/SSR): the constructor throws `UnsupportedError` — construct this provider in browser code only.
 * - **Unusable `localStorage`** (storage access blocked, or private browsing with zero quota): the provider silently degrades to memory-only operation. Check the `persistent` flag to warn users their changes won't be saved.
 *
 * @example
 *  const provider = new LocalStorageProvider();
 *  if (!provider.persistent) console.warn("Changes won't be saved on this device.");
 *  const id = await provider.addItem(users, { name: "Dave" });
 *
 * @see https://shelving.cc/db/LocalStorageProvider
 */
export class LocalStorageProvider<I extends Identifier = Identifier, T extends Data = Data> extends MemoryDBProvider<I, T> {
	/**
	 * Prefix for every storage key written by this provider.
	 *
	 * @see https://shelving.cc/db/LocalStorageProvider/prefix
	 */
	readonly prefix: string;

	/**
	 * Whether this provider is actually persisting to storage.
	 * - `false` when storage exists but is unusable (e.g. blocked by browser settings, or private browsing with zero quota) — the provider still works, but data only lives in memory and is lost when the page closes.
	 *
	 * @see https://shelving.cc/db/LocalStorageProvider/persistent
	 */
	readonly persistent: boolean;

	/** Storage being persisted to, or `undefined` when operating memory-only. */
	private readonly _storage: Storage | undefined;

	/** Persisting tables by collection name, so `storage` events can be routed to them. */
	private readonly _syncTables = new Map<string, LocalStorageTable<I, T>>();

	/** Attached `storage` event listener (so it can be detached on dispose), or `undefined` if none was attached. */
	private readonly _listener: ((event: StorageEvent) => void) | undefined;

	constructor({ prefix = "shelving:", storage }: LocalStorageProviderOptions = {}) {
		super();
		this.prefix = prefix;

		// Resolve the storage to use, throwing in environments that have no `localStorage` at all.
		let resolved = storage;
		if (!resolved) {
			if (!("localStorage" in globalThis))
				throw new UnsupportedError("LocalStorageProvider requires localStorage (construct it in browser code only)", {
					caller: LocalStorageProvider,
				});
			try {
				resolved = globalThis.localStorage;
			} catch {
				// Accessing `localStorage` throws `SecurityError` in some browsers (e.g. storage-partitioned iframes) — degrade to memory-only.
			}
		}

		// Probe with a write+remove: private browsing can expose a `Storage` whose every write throws.
		let persistent = false;
		if (resolved) {
			try {
				const probe = `${prefix}?`;
				resolved.setItem(probe, "?");
				resolved.removeItem(probe);
				persistent = true;
			} catch {
				// Unusable storage — degrade to memory-only.
			}
		}
		this.persistent = persistent;
		this._storage = persistent ? resolved : undefined;

		// Changes made in other tabs/windows arrive as `storage` events on the global scope.
		if (this._storage && typeof globalThis.addEventListener === "function") {
			this._listener = event => this._syncStorage(event);
			globalThis.addEventListener("storage", this._listener);
		}
	}

	protected override _makeTable<II extends I, TT extends T>(collection: Collection<string, II, TT>): MemoryTable<II, TT> {
		if (!this._storage) return super._makeTable(collection);
		const table = new LocalStorageTable<II, TT>(collection, this._storage, this.prefix);
		this._syncTables.set(collection.name, table as LocalStorageTable<I, T>); // `as` needed: the map holds tables of varying subtypes under the provider's base types.
		return table;
	}

	/** Apply a `storage` event (a change made in another tab/window) to the in-memory tables. */
	private _syncStorage({ storageArea, key, newValue }: StorageEvent): void {
		if (storageArea !== this._storage) return;
		if (key === null) {
			// A `null` key means the other tab called `storage.clear()`.
			for (const table of this._syncTables.values()) table.syncClear();
		} else {
			for (const table of this._syncTables.values()) {
				if (key.startsWith(table.keyPrefix)) {
					table.sync(key, newValue);
					break;
				}
			}
		}
	}

	// Implement `AsyncDisposable`
	override async [Symbol.asyncDispose](): Promise<void> {
		if (this._listener) globalThis.removeEventListener("storage", this._listener);
		await super[Symbol.asyncDispose]();
	}
}

/**
 * `MemoryTable` that persists every change to a `Storage` instance for a `LocalStorageProvider`.
 *
 * - Hydrates itself from storage on construction, then persists each write *before* applying it to memory (so a storage failure throws and changes nothing).
 * - Because persistence hooks the table's write primitives, every path into the table persists — including `CacheDBProvider` mirroring and store sequences.
 *
 * @see https://shelving.cc/db/LocalStorageTable
 */
export class LocalStorageTable<I extends Identifier, T extends Data> extends MemoryTable<I, T> {
	/**
	 * Prefix for every storage key belonging to this table, e.g. `"shelving:users:"`.
	 *
	 * @see https://shelving.cc/db/LocalStorageTable/keyPrefix
	 */
	readonly keyPrefix: string;

	/** Storage this table persists to. */
	private readonly _storage: Storage;

	constructor(collection: Collection<string, I, T>, storage: Storage, prefix: string) {
		super(collection);
		this._storage = storage;
		// Percent-encode both parts so the `:` separator is unambiguous: without this, an `id` containing `:`
		// (e.g. collection `a` + id `b:c`) collides with a different collection/id pair (collection `a:b` + id `c`).
		this.keyPrefix = `${prefix}${encodeURIComponent(collection.name)}:`;
		this._hydrate();
	}

	/** Load every persisted item of this table's collection into memory. */
	private _hydrate(): void {
		const items: Item<I, T>[] = [];
		for (let i = 0; i < this._storage.length; i++) {
			const key = this._storage.key(i);
			if (key?.startsWith(this.keyPrefix)) {
				const item = this._parse(this._storage.getItem(key));
				if (item) items.push(item);
			}
		}
		for (const item of items) super._set(item.id, item); // `super._set()` skips persisting back what was just read.
	}

	/** Storage key for an item of this table. */
	private _key(id: I): string {
		return `${this.keyPrefix}${encodeURIComponent(String(id))}`;
	}

	/** Identifier encoded in a storage key of this table. */
	private _decodeKey(key: string): I {
		const raw = decodeURIComponent(key.slice(this.keyPrefix.length));
		return (this.collection.id instanceof StringSchema ? raw : Number(raw)) as I; // `as I` needed: TypeScript can't narrow I from the schema check.
	}

	/** Parse a stored JSON value into an item, or `undefined` if it's malformed. */
	private _parse(value: string | null): Item<I, T> | undefined {
		if (value) {
			try {
				const item: unknown = JSON.parse(value);
				if (isData(item) && "id" in item) return item as Item<I, T>; // `as` needed: stored values are unvalidated — wrap the provider in `ValidationDBProvider` to validate them.
			} catch {
				// Malformed values are skipped, not deleted — they may belong to other code sharing the prefix.
			}
		}
	}

	/** Persist to storage first — a failure (e.g. `QuotaExceededError`) throws before memory changes, keeping the two consistent. */
	protected override _set(id: I, item: Item<I, T>): boolean {
		if (this._data.get(id) === item) return false;
		this._storage.setItem(this._key(id), JSON.stringify(item));
		return super._set(id, item);
	}

	/** Remove from storage first, keeping storage and memory consistent. */
	protected override _delete(id: I): boolean {
		if (!this._data.has(id)) return false;
		this._storage.removeItem(this._key(id));
		return super._delete(id);
	}

	/**
	 * Apply a change made in another tab/window to memory.
	 * - Skips persisting (the change is already in storage) and notifies subscribed sequences.
	 *
	 * @param key Storage key that changed (must start with `keyPrefix`).
	 * @param value New stored JSON value, or `null` if the key was removed.
	 * @see https://shelving.cc/db/LocalStorageTable/sync
	 */
	sync(key: string, value: string | null): void {
		if (value === null) {
			if (super._delete(this._decodeKey(key))) this.next.resolve();
		} else {
			const item = this._parse(value);
			if (item && super._set(item.id, item)) this.next.resolve();
		}
	}

	/**
	 * Apply a `storage.clear()` made in another tab/window to memory.
	 * - Skips persisting (storage is already empty) and notifies subscribed sequences.
	 *
	 * @see https://shelving.cc/db/LocalStorageTable/syncClear
	 */
	syncClear(): void {
		let changed = false;
		for (const id of [...this._data.keys()]) if (super._delete(id)) changed = true;
		if (changed) this.next.resolve();
	}
}
