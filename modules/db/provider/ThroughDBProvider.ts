import type { Data } from "../../util/data.js";
import { awaitDispose } from "../../util/dispose.js";
import type { Identifier, Item, Items, ItemsSequence, OptionalItem, OptionalItemSequence } from "../../util/item.js";
import type { Query } from "../../util/query.js";
import type { Sourceable } from "../../util/source.js";
import type { Updates } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";
import { DBProvider } from "./DBProvider.js";

/**
 * Database provider that passes every core operation straight through to a wrapped `source` provider.
 *
 * - Base for the layered `Through*Provider` family (validation, caching, logging, change tracking); subclasses override individual methods to add behaviour and call `super` to delegate.
 * - Only the core operations delegate to `source` — derived reads (`DBProvider.requireItem()`, `DBProvider.getFirst()`, `DBProvider.requireFirst()`) and two-step query writes are inherited from `DBProvider`, so they route through this provider's own overridden methods and wrapper behaviour applies to everything they do. Wrappers that don't need per-item behaviour override the query writes to pass through to `source` directly.
 * - Exposes `source` and implements `Sourceable`, so wrapped providers can be discovered with `getSource()` / `requireSource()`.
 *
 * @see https://shelving.cc/db/ThroughDBProvider
 */
export class ThroughDBProvider<I extends Identifier, T extends Data> extends DBProvider<I, T> implements Sourceable<DBProvider<I, T>> {
	/**
	 * The wrapped source provider that every operation is delegated to.
	 *
	 * @see https://shelving.cc/db/ThroughDBProvider/source
	 */
	readonly source: DBProvider<I, T>;

	constructor(source: DBProvider<I, T>) {
		super();
		this.source = source;
	}

	override getItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>> {
		return this.source.getItem(collection, id);
	}

	override getItemSequence<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): OptionalItemSequence<II, TT> {
		return this.source.getItemSequence(collection, id);
	}

	override addItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, data: TT): Promise<II> {
		return this.source.addItem(collection, data);
	}

	override setItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		return this.source.setItem(collection, id, data);
	}

	override updateItem<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
		updates: Updates<Item<II, TT>>,
	): Promise<void> {
		return this.source.updateItem(collection, id, updates);
	}

	override deleteItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<void> {
		return this.source.deleteItem(collection, id);
	}

	/** Delegates to `source` so its native counting is kept (the base implementation would fetch the items and count them). */
	override countQuery<II extends I, TT extends T>(collection: Collection<string, II, TT>, query?: Query<Item<II, TT>>): Promise<number> {
		return this.source.countQuery(collection, query);
	}

	override getQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): Promise<Items<II, TT>> {
		return this.source.getQuery(collection, query);
	}

	override getQuerySequence<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): ItemsSequence<II, TT> {
		return this.source.getQuerySequence(collection, query);
	}

	// Run the transaction against the wrapped `source` provider, keeping this provider's behaviour inside the transaction.
	override transact<X>(callback: (provider: DBProvider<I, T>) => Promise<X>): Promise<X> {
		return this.source.transact(transaction => callback(this.cloneWith(transaction)));
	}

	/** Clone this provider with different `source`. */
	cloneWith(source: DBProvider<I, T>): this {
		return Object.create(this, { source: { value: source, enumerable: true } });
	}

	// Implement `AsyncDisposable`
	override async [Symbol.asyncDispose]() {
		await awaitDispose(
			this.source, // Dispose the source API provider.
			super[Symbol.asyncDispose](), // Chain.
		);
	}
}
