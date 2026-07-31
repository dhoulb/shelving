import { UnsupportedError } from "../../error/UnsupportedError.js";
import { StringSchema } from "../../schema/StringSchema.js";
import type { Data } from "../../util/data.js";
import { isData } from "../../util/data.js";
import { awaitDispose } from "../../util/dispose.js";
import type { Identifier, Item } from "../../util/item.js";
import { getItem } from "../../util/item.js";
import type { Collection } from "../collection/Collection.js";
import { MemoryDBProvider, MemoryTable } from "./MemoryDBProvider.js";

/**
 * In-memory database provider that persists every collection to a `Storage` — `localStorage`, `sessionStorage`, or anything else with the same interface.
 *
 * - Extends `MemoryDBProvider`, so all reads, queries, and realtime sequences are served synchronously from memory, and it can seed `ItemStore` / `QueryStore` and act as the cache inside `CacheDBProvider`. The only difference is that collections are backed by `StorageTable` instead of `MemoryTable`.
 * - The storage is a required argument (there is no default), so server code that constructs this provider must reference `localStorage` / `sessionStorage` itself — surfacing the mistake at the callsite instead of deep inside this class.
 * - Treat the persisted data as best-effort: quota is shared across the origin (typically ~5MB) and users can clear it at any time. Data read back from storage is unvalidated — wrap this provider in `ValidationDBProvider` if it may have been written by an older version of your app.
 * - If the storage is unusable (writes blocked by browser settings, or private browsing with zero quota), the provider degrades to memory-only operation — check the `persistent` flag to warn users their changes won't be saved.
 *
 * @example
 *  const provider = new StorageDBProvider(localStorage);
 *  if (!provider.persistent) console.warn("Changes won't be saved on this device.");
 *  const id = await provider.addItem(users, { name: "Dave" });
 *
 * @see https://shelving.cc/db/StorageDBProvider
 */
export class StorageDBProvider<I extends Identifier = Identifier, T extends Data = Data> extends MemoryDBProvider<I, T> {
	/**
	 * Prefix for every storage key written by this provider.
	 *
	 * @see https://shelving.cc/db/StorageDBProvider/prefix
	 */
	readonly prefix: string;

	/**
	 * Whether this provider is actually persisting to storage.
	 * - `false` when storage exists but is unusable (e.g. blocked by browser settings, or private browsing with zero quota) — the provider still works, but data only lives in memory and is lost when the page closes.
	 *
	 * @see https://shelving.cc/db/StorageDBProvider/persistent
	 */
	readonly persistent: boolean;

	/** Storage being persisted to, or `undefined` when operating memory-only. */
	private readonly _storage: Storage | undefined;

	/**
	 * @param storage `Storage` instance to persist to, e.g. `localStorage` or `sessionStorage` (required so environments without one, e.g. the server, fail at the callsite).
	 * @param prefix Prefix for every storage key written by this provider, so it can share an origin's storage with other code (defaults to `"shelving:"`).
	 */
	constructor(storage: Storage, prefix = "shelving:") {
		super();
		this.prefix = prefix;
		if (!storage)
			throw new UnsupportedError("StorageDBProvider requires a Storage, e.g. localStorage or sessionStorage", {
				caller: StorageDBProvider,
			});

		// Probe with a write+remove: private browsing can expose a `Storage` whose every write throws.
		try {
			const probe = `${prefix}?`;
			storage.setItem(probe, "?");
			storage.removeItem(probe);
			this.persistent = true;
			this._storage = storage;
		} catch {
			// Unusable storage — degrade to memory-only.
			this.persistent = false;
			this._storage = undefined;
		}
	}

	/** Back collections with a `StorageTable`, or a plain `MemoryTable` when operating memory-only. */
	override createTable<II extends I, TT extends T>(collection: Collection<string, II, TT>): MemoryTable<II, TT> {
		return this._storage ? new StorageTable<II, TT>(collection, this._storage, this.prefix) : super.createTable(collection);
	}
}

/**
 * `MemoryTable` that persists its items to a `Storage` instance — self-contained, so it can also be used independently of `StorageDBProvider`.
 *
 * - Hydrates itself from storage on construction, then persists each write *before* applying it to memory, so a failed write (e.g. `QuotaExceededError` when the origin's quota is full) throws and leaves memory and storage consistent.
 * - Items are stored as JSON under keys formatted as `{prefix}{collection}:{id}`, so values must be JSON-serializable. The id in the key is authoritative — an `id` stored inside the JSON is overridden.
 * - Listens for `storage` events, so changes made in other tabs/windows update memory and notify realtime sequences. Dispose the table (or its provider) to remove the listener.
 *
 * @see https://shelving.cc/db/StorageTable
 */
export class StorageTable<I extends Identifier, T extends Data> extends MemoryTable<I, T> {
	/** Prefix for every storage key belonging to this table, e.g. `"shelving:users:"`. */
	private readonly _prefix: string;

	/** Storage this table persists to. */
	private readonly _storage: Storage;

	/** Attached `storage` event listener (so it can be detached on dispose), or `undefined` if none was attached. */
	private readonly _listener: ((event: StorageEvent) => void) | undefined;

	constructor(collection: Collection<string, I, T>, storage: Storage, prefix = "shelving:") {
		super(collection);
		this._storage = storage;
		this._prefix = `${prefix}${collection.name}:`;
		this._hydrate();

		// Changes made in other tabs/windows arrive as `storage` events on the global scope.
		if (typeof globalThis.addEventListener === "function") {
			this._listener = event => this._syncStorage(event);
			globalThis.addEventListener("storage", this._listener);
		}
	}

	/** Load every persisted item of this table's collection into memory (directly, skipping the persist-back in `setItem()`). */
	private _hydrate(): void {
		for (let i = 0; i < this._storage.length; i++) {
			const key = this._storage.key(i);
			if (key?.startsWith(this._prefix)) {
				const id = this._decodeKey(key);
				const item = this._parse(id, this._storage.getItem(key));
				if (item) this._data.set(id, item);
			}
		}
	}

	/** Storage key for an item of this table. */
	private _key(id: I): string {
		return `${this._prefix}${id}`;
	}

	/** Identifier encoded in a storage key of this table. */
	private _decodeKey(key: string): I {
		const raw = key.slice(this._prefix.length);
		return (this.collection.id instanceof StringSchema ? raw : Number(raw)) as I; // `as I` needed: TypeScript can't narrow I from the schema check.
	}

	/** Parse a stored JSON value into an item with the given id, or `undefined` if it's malformed. */
	private _parse(id: I, value: string | null): Item<I, T> | undefined {
		if (value) {
			try {
				const data: unknown = JSON.parse(value);
				if (isData(data)) return getItem(id, data as T); // `as T` needed: stored values are unvalidated — wrap the provider in `ValidationDBProvider` to validate them.
			} catch {
				// Malformed values are skipped, not deleted — they may belong to other code sharing the prefix.
			}
		}
	}

	/**
	 * Apply a `storage` event (a change made in another tab/window) to this table.
	 * - Reuses `setItem()` / `deleteItem()` — re-persisting the value already in storage is a no-op, and same-tab writes don't fire `storage` events, so this can't loop.
	 */
	private _syncStorage({ storageArea, key, newValue }: StorageEvent): void {
		if (storageArea !== this._storage) return;
		if (key === null) {
			this.deleteQuery({}); // A `null` key means the other tab called `storage.clear()`.
		} else if (key.startsWith(this._prefix)) {
			const id = this._decodeKey(key);
			const item = newValue !== null ? this._parse(id, newValue) : undefined;
			item ? this.setItem(id, item) : this.deleteItem(id);
		}
	}

	/** Persist to storage first — a failure (e.g. `QuotaExceededError`) throws before memory changes, keeping the two consistent. */
	override setItem(id: I, data: Item<I, T> | T): void {
		const item = getItem(id, data);
		if (this._data.get(id) !== item) this._storage.setItem(this._key(id), JSON.stringify(item));
		super.setItem(id, item);
	}

	/** Remove from storage first, keeping storage and memory consistent. */
	override deleteItem(id: I): void {
		if (this._data.has(id)) this._storage.removeItem(this._key(id));
		super.deleteItem(id);
	}

	// Implement `AsyncDisposable`
	override async [Symbol.asyncDispose](): Promise<void> {
		await awaitDispose(
			() => this._listener && globalThis.removeEventListener("storage", this._listener), // Stop listening for `storage` events.
			super[Symbol.asyncDispose](), // Chain.
		);
	}
}
