import type { DeleteItemChange, SetItemChange, UpdateItemChange } from "../change/Change.js";
import type { AbstractProvider, AsyncProvider, Provider } from "../provider/Provider.js";
import type { ErrorCallback, StopCallback, ValueCallback } from "../util/callback.js";
import type { Data } from "../util/data.js";
import type { Updates } from "../util/update.js";
import { type ItemData, type ItemValue, getItemQuery } from "../util/item.js";
import { getRequired } from "../util/optional.js";
import { runSequence } from "../util/sequence.js";
import { AsyncQueryReference, QueryReference } from "./QueryReference.js";

/** Reference to an item in a synchronous or asynchronous database. */
export abstract class AbstractItemReference<T extends Data = Data> implements AsyncIterable<ItemValue<T>> {
	abstract readonly provider: AbstractProvider;
	readonly collection: string;
	readonly id: string;
	constructor(collection: string, id: string) {
		this.collection = collection;
		this.id = id;
	}

	/** Get a query corresponding to this item. */
	abstract optional: QueryReference<T> | AsyncQueryReference<T>;

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
	getSet(data: T): SetItemChange<T> {
		return { action: "set", collection: this.collection, id: this.id, data };
	}

	/** Get an update change for this item. */
	getUpdate(updates: Updates<T>): UpdateItemChange<T> {
		return { action: "update", collection: this.collection, id: this.id, updates };
	}

	/** Get a delete change for this item. */
	getDelete(): DeleteItemChange<T> {
		return { action: "delete", collection: this.collection, id: this.id };
	}

	// Implement toString()
	toString(): string {
		return `${this.collection}/${this.id}`;
	}

	/** Subscribe to this item. */
	subscribe(onNext?: ValueCallback<ItemValue<T>>, onError?: ErrorCallback): StopCallback {
		return runSequence(this, onNext, onError);
	}

	// Implement AsyncIterable
	[Symbol.asyncIterator](): AsyncIterator<ItemValue<T>> {
		return this.provider.getItemSequence<T>(this.collection, this.id)[Symbol.asyncIterator]();
	}
}

/** Reference to an item in a synchronous database. */
export class ItemReference<T extends Data = Data> extends AbstractItemReference<T> {
	readonly provider: Provider;
	constructor(provider: Provider, collection: string, id: string) {
		super(collection, id);
		this.provider = provider;
	}
	get optional(): QueryReference<T> {
		return new QueryReference(this.provider, this.collection, getItemQuery<T>(this.id));
	}
	get exists(): boolean {
		return !!this.provider.getItem(this.collection, this.id);
	}
	get value(): ItemValue<T> {
		return this.provider.getItem<T>(this.collection, this.id);
	}
	get data(): ItemData<T> {
		return getRequired(this.value);
	}
	set(data: T): void {
		return this.provider.setItem<T>(this.collection, this.id, data);
	}
	update(updates: Updates<T>): void {
		return this.provider.updateItem<T>(this.collection, this.id, updates);
	}
	delete(): void {
		return this.provider.deleteItem<T>(this.collection, this.id);
	}
}

/** Reference to an item in an asynchronous database. */
export class AsyncItemReference<T extends Data = Data> extends AbstractItemReference<T> {
	readonly provider: AsyncProvider;
	constructor(provider: AsyncProvider, collection: string, id: string) {
		super(collection, id);
		this.provider = provider;
	}
	get optional(): AsyncQueryReference<T> {
		return new AsyncQueryReference(this.provider, this.collection, getItemQuery<T>(this.id));
	}
	get exists(): Promise<boolean> {
		return this.provider.getItem(this.collection, this.id).then(Boolean);
	}
	get value(): Promise<ItemValue<T>> {
		return this.provider.getItem<T>(this.collection, this.id);
	}
	get data(): Promise<ItemData<T>> {
		return this.value.then(getRequired);
	}
	set(data: T): Promise<void> {
		return this.provider.setItem<T>(this.collection, this.id, data);
	}
	update(updates: Updates<T>): Promise<void> {
		return this.provider.updateItem<T>(this.collection, this.id, updates);
	}
	delete(): Promise<void> {
		return this.provider.deleteItem<T>(this.collection, this.id);
	}
}
