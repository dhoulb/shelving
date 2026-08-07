import type { MutableArray } from "../../util/array.js";
import type { Data } from "../../util/data.js";
import type { Identifier, Item } from "../../util/item.js";
import type { Updates } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";
import type { DBProvider } from "./DBProvider.js";
import { ThroughDBProvider } from "./ThroughDBProvider.js";

/**
 * Structured log entry recording a single database write performed through a `ChangesDBProvider`.
 *
 * - `action` is the kind of write; `collection` is the `Collection` the write applies to; `id` is the item that was written; `data` and `updates` carry whichever fields apply to that write.
 *
 * @see https://shelving.cc/db/DBChange
 */
export type DBChange<I extends Identifier, T extends Data = Data> = {
	readonly action: "add" | "set" | "update" | "delete";
	readonly collection: Collection<string, I, T>;
	readonly id: I;
	readonly data?: unknown;
	readonly updates?: unknown;
};

/**
 * Database provider that records every write it performs to its `changes` log.
 *
 * - Wraps a `source` provider, delegates each write, then appends a `DBChange` entry describing what happened.
 * - Every change is an explicit per-item write with an `id` — query writes are inherited two-step from `ThroughDBProvider`, so they arrive here as the individual item writes they resolved to.
 * - Replay the log onto another provider with `ChangesDBProvider.replay()`.
 * - Useful for building audit logging, change feeds, or assertions in tests; reads are passed straight through and not logged.
 *
 * @see https://shelving.cc/db/ChangesDBProvider
 */
export class ChangesDBProvider<I extends Identifier, T extends Data> extends ThroughDBProvider<I, T> {
	/**
	 * The log of writes performed through this provider, in the order they happened.
	 *
	 * @see https://shelving.cc/db/ChangesDBProvider/changes
	 */
	get changes(): ReadonlyArray<DBChange<I, T>> {
		return this._changes;
	}
	readonly _changes: MutableArray<DBChange<I, T>> = [];

	/** Log an `"add"` change after writing. */
	override async addItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, data: TT): Promise<II> {
		const id = await super.addItem(collection, data);
		this._changes.push({ action: "add", collection, id, data });
		return id;
	}

	/** Log a `"set"` change after writing. */
	override async setItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		await super.setItem(collection, id, data);
		this._changes.push({ action: "set", collection, id, data });
	}

	/** Log an `"update"` change after writing. */
	override async updateItem<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
		updates: Updates<Item<II, TT>>,
	): Promise<void> {
		await super.updateItem(collection, id, updates);
		this._changes.push({ action: "update", collection, id, updates });
	}

	/** Log a `"delete"` change after writing. */
	override async deleteItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<void> {
		await super.deleteItem(collection, id);
		this._changes.push({ action: "delete", collection, id });
	}

	/**
	 * Replay the `changes` log onto another provider, re-issuing each write in order.
	 *
	 * - Useful for audit replay or syncing a secondary store.
	 * - `"add"` changes replay as `DBProvider.setItem()` with the logged id, so the target keeps the same generated ids.
	 * - The changes replay as a sequence of awaited writes — the replay itself is not atomic.
	 *
	 * @param provider Provider to replay the changes onto.
	 * @example await changes.replay(mirror);
	 * @see https://shelving.cc/db/ChangesDBProvider/replay
	 */
	async replay(provider: DBProvider<I, T>): Promise<void> {
		// `as` casts needed: the log stores `data` and `updates` loosely as `unknown`.
		for (const { action, collection, id, data, updates } of this._changes) {
			if (action === "delete") await provider.deleteItem(collection, id);
			else if (action === "update") await provider.updateItem(collection, id, updates as Updates<Item<I, T>>);
			else await provider.setItem(collection, id, data as T);
		}
	}

	// Override so that transaction copies get their own log.
	override cloneWith(source: DBProvider<I, T>): this {
		const clone = super.cloneWith(source);
		Object.defineProperty(clone, "_changes", { value: [], enumerable: false });
		return clone;
	}

	// Override to log the transaction's writes after it commits — a failed transaction logs nothing.
	// The merge must happen after `source.transact()` resolves: backends may retry the callback or fail the commit itself, and only the committed attempt's writes belong in the log.
	override async transact<X>(callback: (provider: DBProvider<I, T>) => Promise<X>): Promise<X> {
		let transaction: this | undefined;
		const result = await this.source.transact(provider => callback((transaction = this.cloneWith(provider))));
		if (transaction) this._changes.push(...transaction.changes);
		return result;
	}
}
