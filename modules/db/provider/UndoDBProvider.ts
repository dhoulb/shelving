import type { Data } from "../../util/data.js";
import type { Identifier, Item } from "../../util/item.js";
import type { Updates } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";
import { RecordingDBProvider } from "./RecordingDBProvider.js";

/**
 * Database provider that records every operation and can undo its own writes.
 *
 * - Extends `RecordingDBProvider`, additionally reading each item before the first write that touches it — so the log always contains every touched item's original state.
 * - Call `undo()` to restore the wrapped provider to the state the log first observed, e.g. rolling back optimistic local updates after a failed server call.
 * - The extra read is skipped when the log already establishes the item's state (an earlier read observed it, or an earlier add created it) — over a local `MemoryDBProvider` the reads are effectively free anyway.
 *
 * @example
 *  const local = new UndoDBProvider(memory);
 *  await runServiceLogic(local); // Applies locally right away.
 *  try {
 *  	await api.push(local.writes); // Send the writes to the server.
 *  } catch {
 *  	await local.undo(); // Server failed — restore the local copy.
 *  }
 *
 * @see https://shelving.cc/db/UndoDBProvider
 */
export class UndoDBProvider<I extends Identifier, T extends Data> extends RecordingDBProvider<I, T> {
	/** Whether the log already establishes the original state of an item (an earlier read observed it, or an earlier add created it). */
	protected _isEstablished(collection: Collection<string, I, T>, id: I): boolean {
		return this._operations.some(
			operation => operation.collection === collection && operation.id === id && (operation.action === "get" || operation.action === "add"),
		);
	}

	/** Read the item first (recording its original state) if the log doesn't already establish it. */
	override async setItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		if (!this._isEstablished(collection, id)) await this.getItem(collection, id);
		await super.setItem(collection, id, data);
	}

	/** Read the item first (recording its original state) if the log doesn't already establish it. */
	override async updateItem<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
		updates: Updates<Item<II, TT>>,
	): Promise<void> {
		if (!this._isEstablished(collection, id)) await this.getItem(collection, id);
		await super.updateItem(collection, id, updates);
	}

	/** Read the item first (recording its original state) if the log doesn't already establish it. */
	override async deleteItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<void> {
		if (!this._isEstablished(collection, id)) await this.getItem(collection, id);
		await super.deleteItem(collection, id);
	}

	/**
	 * Restore the wrapped provider to the state the log first observed, undoing this provider's writes.
	 *
	 * - Applies the state-establishing operations in reverse order, so the earliest observed state of each item wins: reads restore the item that was observed (or delete it when the read confirmed it absent), and adds delete (the item did not exist before).
	 * - Restores touched items unconditionally, so concurrent writes made to those items since the recording are overwritten.
	 * - Writes directly to `source` without recording, so the log still describes the original operations afterwards.
	 *
	 * @example await provider.undo();
	 * @see https://shelving.cc/db/UndoDBProvider/undo
	 */
	async undo(): Promise<void> {
		// `as` cast needed: the log stores `data` loosely as `unknown`.
		for (const { action, collection, id, data } of this._operations.toReversed()) {
			if (action === "get" && data) await this.source.setItem(collection, id, data as T);
			else if (action === "get" || action === "add") await this.source.deleteItem(collection, id);
		}
	}
}
