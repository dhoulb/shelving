import type { DeleteChange, SetChange, UpdateChange } from "./Change.js";
import type { AsyncProvider, Provider } from "../provider/Provider.js";
import type { ImmutableArray } from "../util/array.js";
import type { Callback, ErrorCallback, StopCallback } from "../util/callback.js";
import type { Data } from "../util/data.js";
import type { Query } from "../util/query.js";
import type { Updates } from "../util/update.js";
import { getRequired } from "../util/null.js";
import { runSequence } from "../util/sequence.js";

/** Item data with a string ID that uniquely identifies it. */
export type ItemData<T extends Data = Data> = T & { id: string };

/** Entity or `null` to indicate the item doesn't exist. */
export type ItemValue<T extends Data = Data> = ItemData<T> | undefined;

/** Get the ID from item data. */
export const getID = <T extends Data>({ id }: ItemData<T>): string => id;

/** Get the IDs of an iterable set item data. */
export function* getIDs<T extends Data>(entities: Iterable<ItemData<T>>): Iterable<string> {
	for (const { id } of entities) yield id;
}

/** An array of item data. */
export type ItemArray<T extends Data = Data> = ImmutableArray<ItemData<T>>;

/** A set of query constraints for item data. */
export type ItemQuery<T extends Data = Data> = Query<ItemData<T>>;

/** Get query that targets a single database item by its ID. */
export const getItemQuery = (id: string): Query<{ id: string }> => ({ id, $limit: 1 });

/** Reference to an item in a synchronous or asynchronous database. */
abstract class AbstractItemReference<T extends Data = Data> implements AsyncIterable<ItemValue<T>> {
	abstract readonly provider: Provider | AsyncProvider;
	readonly collection: string;
	readonly id: string;
	constructor(collection: string, id: string) {
		this.collection = collection;
		this.id = id;
	}

	/**
	 * Does this item exist?
	 * @return `true` if an item exists or `false` otherwise (possibly promised).
	 */
	abstract exists: boolean | PromiseLike<boolean>;

	/**
	 * Get the optional data of this item.
	 * @return Document's data, or `null` if the item doesn't exist (possibly promised).
	 */
	abstract value: ItemValue<T> | PromiseLike<ItemValue<T>>;

	/**
	 * Get the data of this item.
	 * - Useful for destructuring, e.g. `{ name, title } = await itemThatMustExist.asyncData`
	 *
	 * @return Document's data (possibly promised).
	 * @throws RequiredError if the item does not exist.
	 */
	abstract data: ItemData<T> | PromiseLike<ItemData<T>>;

	/** Set the complete data of this item. */
	abstract set(data: T): void | PromiseLike<void>;

	/** Update this item. */
	abstract update(updates: Updates<T>): void | PromiseLike<void>;

	/** Delete this item. */
	abstract delete(): void | PromiseLike<void>;
	/** Get a set change for this item. */
	getSet(data: T): SetChange<T> {
		return { action: "set", collection: this.collection, id: this.id, data };
	}

	/** Get an update change for this item. */
	getUpdate(updates: Updates<T>): UpdateChange<T> {
		return { action: "update", collection: this.collection, id: this.id, updates };
	}

	/** Get a delete change for this item. */
	getDelete(): DeleteChange {
		return { action: "delete", collection: this.collection, id: this.id };
	}

	// Implement toString()
	toString(): string {
		return `${this.collection}/${this.id}`;
	}

	/** Subscribe to this item. */
	subscribe(onNext?: Callback<ItemValue<T>>, onError?: ErrorCallback): StopCallback {
		return runSequence(this, onNext, onError);
	}

	// Implement AsyncIterable
	[Symbol.asyncIterator](): AsyncIterator<ItemValue<T>> {
		return this.provider.getItemSequence(this.collection, this.id)[Symbol.asyncIterator]() as AsyncIterator<ItemValue<T>>;
	}
}

/** Reference to an item in a synchronous database. */
export class ItemReference<T extends Data = Data> extends AbstractItemReference<T> {
	readonly provider: Provider;
	constructor(provider: Provider, collection: string, id: string) {
		super(collection, id);
		this.provider = provider;
	}
	get exists(): boolean {
		return !!this.provider.getItem(this.collection, this.id);
	}
	get value(): ItemValue<T> {
		return this.provider.getItem(this.collection, this.id) as ItemValue<T>;
	}
	get data(): ItemData<T> {
		return getRequired(this.value);
	}
	set(data: T): void {
		return this.provider.setItem(this.collection, this.id, data);
	}
	update(updates: Updates<T>): void {
		return this.provider.updateItem(this.collection, this.id, updates);
	}
	delete(): void {
		return this.provider.deleteItem(this.collection, this.id);
	}
}

/** Reference to an item in an asynchronous database. */
export class AsyncItemReference<T extends Data = Data> extends AbstractItemReference<T> {
	readonly provider: AsyncProvider;
	constructor(provider: AsyncProvider, collection: string, id: string) {
		super(collection, id);
		this.provider = provider;
	}
	get exists(): Promise<boolean> {
		return this.provider.getItem(this.collection, this.id).then(Boolean);
	}
	get value(): Promise<ItemValue<T>> {
		return this.provider.getItem(this.collection, this.id) as Promise<ItemValue<T>>;
	}
	get data(): Promise<ItemData<T>> {
		return this.value.then(getRequired);
	}
	set(data: T): Promise<void> {
		return this.provider.setItem(this.collection, this.id, data);
	}
	update(updates: Updates<T>): Promise<void> {
		return this.provider.updateItem(this.collection, this.id, updates);
	}
	delete(): Promise<void> {
		return this.provider.deleteItem(this.collection, this.id);
	}
}
