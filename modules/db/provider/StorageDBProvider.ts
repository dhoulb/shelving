import { UnsupportedError } from "../../error/UnsupportedError.js";
import { StringSchema } from "../../schema/StringSchema.js";
import type { Data } from "../../util/data.js";
import { isData } from "../../util/data.js";
import type { Identifier, Item } from "../../util/item.js";
import { getItem } from "../../util/item.js";
import type { Collection } from "../collection/Collection.js";
import { MemoryDBProvider, MemoryTable } from "./MemoryDBProvider.js";

/**
 * In-memory database provider that persists every collection to a `Storage` — `localStorage`, `sessionStorage`, or anything else with the same interface.
 *
 * - Extends `MemoryDBProvider`, so all reads, queries, and realtime sequences are served synchronously from memory, and it can seed `ItemStore` / `QueryStore` and act as the cache inside `CacheDBProvider`.
 * - The storage is a required argument (there is no default), so server code that constructs this provider must reference `localStorage` / `sessionStorage` itself — surfacing the mistake at the callsite instead of deep inside this class.
 * - Each collection is hydrated from storage once, lazily, on first access; after that every write persists to storage *before* it is applied to memory, so a failed write (e.g. `QuotaExceededError` when the origin's quota is full) throws and leaves memory and storage consistent.
 * - Items are stored as JSON under keys formatted as `{prefix}{collection}:{id}`, so values must be JSON-serializable.
 * - Listens for `storage` events, so changes made in other tabs/windows update memory and notify realtime sequences.
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

	/** Attached `storage` event listener (so it can be detached on dispose), or `undefined` if none was attached. */
	private readonly _listener: ((event: StorageEvent) => void) | undefined;

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

		// Changes made in other tabs/windows arrive as `storage` events on the global scope.
		if (this._storage && typeof globalThis.addEventListener === "function") {
			this._listener = event => this._syncStorage(event);
			globalThis.addEventListener("storage", this._listener);
		}
	}

	override createTable<II extends I, TT extends T>(collection: Collection<string, II, TT>): MemoryTable<II, TT> {
		return this._storage ? new StorageTable<II, TT>(collection, this._storage, this.prefix) : super.createTable(collection);
	}

	/** Every existing table that persists to storage (all of them, whenever the `storage` event listener is attached). */
	private *_storageTables(): Iterable<StorageTable<I, T>> {
		for (const table of Object.values(this._tables)) if (table instanceof StorageTable) yield table;
	}

	/** Apply a `storage` event (a change made in another tab/window) to the in-memory tables. */
	private _syncStorage({ storageArea, key, newValue }: StorageEvent): void {
		if (storageArea !== this._storage) return;
		// A `null` key means the other tab called `storage.clear()`; otherwise each table applies keys matching its own prefix.
		if (key === null) for (const table of this._storageTables()) table.syncClear();
		else for (const table of this._storageTables()) table.syncItem(key, newValue);
	}

	// Implement `AsyncDisposable`
	override async [Symbol.asyncDispose](): Promise<void> {
		if (this._listener) globalThis.removeEventListener("storage", this._listener);
		await super[Symbol.asyncDispose]();
	}
}

/**
 * `MemoryTable` that persists every change to a `Storage` instance for a `StorageDBProvider`.
 *
 * - Hydrates itself from storage on construction, then persists each write *before* applying it to memory (so a storage failure throws and changes nothing).
 * - Because persistence hooks the table's write primitives, every path into the table persists — including `CacheDBProvider` mirroring and store sequences.
 *
 * @see https://shelving.cc/db/StorageTable
 */
export class StorageTable<I extends Identifier, T extends Data> extends MemoryTable<I, T> {
	/** Prefix for every storage key belonging to this table, e.g. `"shelving:users:"`. */
	private readonly _prefix: string;

	/** Storage this table persists to. */
	private readonly _storage: Storage;

	constructor(collection: Collection<string, I, T>, storage: Storage, prefix: string) {
		super(collection);
		this._storage = storage;
		this._prefix = `${prefix}${collection.name}:`;
		this._hydrate();
	}

	/** Load every persisted item of this table's collection into memory. */
	private _hydrate(): void {
		for (let i = 0; i < this._storage.length; i++) {
			const key = this._storage.key(i);
			if (key?.startsWith(this._prefix)) {
				const id = this._decodeKey(key);
				const item = this._parse(id, this._storage.getItem(key));
				if (item) super._set(id, item); // `super._set()` skips persisting back what was just read.
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
	 * Apply a changed storage key from another tab/window to memory.
	 * - Ignores keys that don't belong to this table, skips persisting (the change is already in storage), and notifies subscribed sequences.
	 *
	 * @param key Storage key that changed.
	 * @param value New stored JSON value, or `null` if the key was removed.
	 * @see https://shelving.cc/db/StorageTable/syncItem
	 */
	syncItem(key: string, value: string | null): void {
		if (!key.startsWith(this._prefix)) return;
		const id = this._decodeKey(key);
		if (value === null) {
			if (super._delete(id)) this.next.resolve();
		} else {
			const item = this._parse(id, value);
			if (item && super._set(id, item)) this.next.resolve();
		}
	}

	/**
	 * Apply a `storage.clear()` made in another tab/window to memory.
	 * - Skips persisting (storage is already empty) and notifies subscribed sequences.
	 *
	 * @see https://shelving.cc/db/StorageTable/syncClear
	 */
	syncClear(): void {
		let changed = false;
		for (const id of [...this._data.keys()]) if (super._delete(id)) changed = true;
		if (changed) this.next.resolve();
	}
}
