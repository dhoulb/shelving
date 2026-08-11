import type { ImmutableArray, MutableArray } from "../../util/array.js";
import type { Data } from "../../util/data.js";
import type { Identifier, Item, Items, OptionalItem } from "../../util/item.js";
import type { Query } from "../../util/query.js";
import type { Updates } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";
import type { DBProvider } from "./DBProvider.js";
import { ThroughDBProvider } from "./ThroughDBProvider.js";

/**
 * Structured log entry recording a single database operation performed through a `RecordingDBProvider`.
 *
 * - `action` is the kind of operation; `collection` is the `Collection` it applies to; `id` is the item involved; `data` and `updates` carry whichever fields apply to that operation.
 * - A `"get"` operation records a read — `data` is the item that was observed, or `undefined` if the read confirmed the item absent.
 *
 * @see https://shelving.cc/db/DBOperation
 */
export type DBOperation<I extends Identifier = Identifier, T extends Data = Data> = {
	readonly action: "get" | "add" | "set" | "update" | "delete";
	readonly collection: Collection<string, I, T>;
	readonly id: I;
	readonly data?: unknown;
	readonly updates?: unknown;
};

/**
 * Readonly array of `DBOperation` entries, e.g. the log recorded by a `RecordingDBProvider`.
 *
 * @see https://shelving.cc/db/DBOperations
 */
export type DBOperations<I extends Identifier = Identifier, T extends Data = Data> = ImmutableArray<DBOperation<I, T>>;

/**
 * Replay a list of database operations onto a provider, re-issuing each one in order.
 *
 * - Writes re-issue as the corresponding item write — `"add"` replays as `DBProvider.setItem()` with the logged id, so the target keeps the same generated ids.
 * - `"get"` reads apply what they observed — the item is set, or deleted when the read confirmed it absent. That's right for refreshing a mirror or cache, and wrong for an authoritative target, where an observed snapshot would overwrite newer data — replay only the writes there (see `RecordingDBProvider.replayWrites()`).
 * - Operations re-issue as a sequence of awaited writes — the replay itself is not atomic.
 *
 * @param provider Provider to replay the operations onto.
 * @param operations Operations to replay, in order.
 * @example await replayOperations(mirror, recording.operations);
 * @see https://shelving.cc/db/replayOperations
 */
export async function replayOperations<I extends Identifier, T extends Data>(
	provider: DBProvider<I, T>,
	operations: DBOperations<I, T>,
): Promise<void> {
	// `as` casts needed: the log stores `data` and `updates` loosely as `unknown`.
	for (const { action, collection, id, data, updates } of operations) {
		if (action === "update") await provider.updateItem(collection, id, updates as Updates<Item<I, T>>);
		else if (action === "delete") await provider.deleteItem(collection, id);
		else if (action === "get" && !data) await provider.deleteItem(collection, id);
		else await provider.setItem(collection, id, data as T); // Observed items, adds, and sets all replay as the item's full data.
	}
}

/**
 * Database provider that records every operation it performs to its `operations` log.
 *
 * - Wraps a `source` provider, delegates each operation, then appends a `DBOperation` entry describing what happened.
 * - Records reads as well as writes: `getItem()` logs a `"get"` with the item it observed (or its confirmed absence), and `getQuery()` logs a `"get"` per item returned. Derived reads and two-step query writes are inherited, so everything they do is recorded per item too. Realtime sequences are not recorded.
 * - Replay the log onto another provider with `replay()`, `replayWrites()`, or `replayReads()`.
 * - Useful for building audit logging, change feeds, optimistic updates (see `UndoDBProvider`), or assertions in tests.
 *
 * @see https://shelving.cc/db/RecordingDBProvider
 */
export class RecordingDBProvider<I extends Identifier, T extends Data> extends ThroughDBProvider<I, T> {
	/**
	 * The log of operations performed through this provider, in the order they happened.
	 *
	 * @see https://shelving.cc/db/RecordingDBProvider/operations
	 */
	get operations(): DBOperations<I, T> {
		return this._operations;
	}
	readonly _operations: MutableArray<DBOperation<I, T>> = [];

	/**
	 * The write operations from the `operations` log, in the order they happened.
	 *
	 * @see https://shelving.cc/db/RecordingDBProvider/writes
	 */
	get writes(): DBOperations<I, T> {
		return this._operations.filter(({ action }) => action !== "get");
	}

	/**
	 * The `"get"` read operations from the `operations` log, in the order they happened.
	 *
	 * @see https://shelving.cc/db/RecordingDBProvider/reads
	 */
	get reads(): DBOperations<I, T> {
		return this._operations.filter(({ action }) => action === "get");
	}

	/** Log a `"get"` operation recording the item that was observed (or its confirmed absence). */
	override async getItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>> {
		const item = await super.getItem(collection, id);
		this._operations.push({ action: "get", collection, id, data: item });
		return item;
	}

	/** Log a `"get"` operation for each item the query observed. */
	override async getQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): Promise<Items<II, TT>> {
		const items = await super.getQuery(collection, query);
		for (const item of items) this._operations.push({ action: "get", collection, id: item.id, data: item });
		return items;
	}

	/** Log an `"add"` operation after writing. */
	override async addItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, data: TT): Promise<II> {
		const id = await super.addItem(collection, data);
		this._operations.push({ action: "add", collection, id, data });
		return id;
	}

	/** Log a `"set"` operation after writing. */
	override async setItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		await super.setItem(collection, id, data);
		this._operations.push({ action: "set", collection, id, data });
	}

	/** Log an `"update"` operation after writing. */
	override async updateItem<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
		updates: Updates<Item<II, TT>>,
	): Promise<void> {
		await super.updateItem(collection, id, updates);
		this._operations.push({ action: "update", collection, id, updates });
	}

	/** Log a `"delete"` operation after writing. */
	override async deleteItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<void> {
		await super.deleteItem(collection, id);
		this._operations.push({ action: "delete", collection, id });
	}

	/**
	 * Replay every recorded operation onto another provider, in order.
	 * - Reads apply what they observed and writes re-issue, so this refreshes a mirror or cache exactly — see `replayOperations()`.
	 * - Use `replayWrites()` for an authoritative target, where applying observed reads would overwrite newer data.
	 *
	 * @param provider Provider to replay the operations onto.
	 * @example await recording.replay(mirror);
	 * @see https://shelving.cc/db/RecordingDBProvider/replay
	 */
	replay(provider: DBProvider<I, T>): Promise<void> {
		return replayOperations(provider, this._operations);
	}

	/**
	 * Replay only the recorded write operations onto another provider, in order.
	 * - The right call for authoritative targets — applying a log to a real database, audit replay, syncing a second source of truth — where updates should compose onto current state and observed reads must never overwrite newer data.
	 *
	 * @param provider Provider to replay the writes onto.
	 * @example await recording.replayWrites(db);
	 * @see https://shelving.cc/db/RecordingDBProvider/replayWrites
	 */
	replayWrites(provider: DBProvider<I, T>): Promise<void> {
		return replayOperations(provider, this.writes);
	}

	/**
	 * Replay only the recorded `"get"` read operations onto another provider, in order.
	 * - Applies what each read observed (setting the item, or deleting it when the read confirmed absence) — e.g. warming a cache from a recorded session.
	 *
	 * @param provider Provider to replay the reads onto.
	 * @example await recording.replayReads(cache.memory);
	 * @see https://shelving.cc/db/RecordingDBProvider/replayReads
	 */
	replayReads(provider: DBProvider<I, T>): Promise<void> {
		return replayOperations(provider, this.reads);
	}

	// Override so that transaction copies get their own log.
	override cloneWith(source: DBProvider<I, T>): this {
		const clone = super.cloneWith(source);
		Object.defineProperty(clone, "_operations", { value: [], enumerable: false });
		return clone;
	}

	// Override to log the transaction's operations after it commits — a failed transaction logs nothing.
	// The merge must happen after `source.transact()` resolves: backends may retry the callback or fail the commit itself, and only the committed attempt's operations belong in the log.
	override async transact<X>(callback: (provider: DBProvider<I, T>) => Promise<X>): Promise<X> {
		let transaction: this | undefined;
		const result = await this.source.transact(provider => callback((transaction = this.cloneWith(provider))));
		if (transaction) this._operations.push(...transaction.operations);
		return result;
	}
}
