import type { ImmutableArray } from "../util/array.js";
import type { Stop, Handler, Dispatch } from "../util/function.js";
import type { Provider, AsyncProvider } from "../provider/Provider.js";
import type { Updates } from "../update/DataUpdate.js";
import { Statement } from "../constraint/Statement.js";
import { Filter, FilterKey } from "../constraint/Filter.js";
import { Filters } from "../constraint/Filters.js";
import { Data, getData } from "../util/data.js";
import { runSequence } from "../util/sequence.js";
import type { DeleteChange, SetChange, UpdateChange } from "./Change.js";

/** Item data with a string ID that uniquely identifies it. */
export type ItemData<T extends Data = Data> = T & { id: string };

/** Entity or `null` to indicate the item doesn't exist. */
export type ItemValue<T extends Data = Data> = ItemData<T> | null;

/** Get the ID from item data. */
export const getID = <T extends Data>({ id }: ItemData<T>): string => id;

/** Get the IDs of an iterable set item data. */
export function* getIDs<T extends Data>(entities: Iterable<ItemData<T>>): Iterable<string> {
	for (const { id } of entities) yield id;
}

/** An array of item data. */
export type ItemArray<T extends Data = Data> = ImmutableArray<ItemData<T>>;

/** A set of query constraints for item data. */
export type ItemStatement<T extends Data = Data> = Statement<ItemData<T>>;

/** Get a `Filter` instance that targets a single item by its ID. */
export const getItemStatement = <T extends Data>(id: string) => new Statement<ItemData<T>>(new Filters<ItemData<T>>(new Filter<ItemData<T>>("id" as FilterKey<ItemData<T>>, id)), undefined, 1);

/** Reference to an item in a synchronous or asynchronous database. */
abstract class BaseItem<T extends Data = Data> implements AsyncIterable<ItemValue<T>> {
	abstract readonly provider: Provider | AsyncProvider;
	abstract readonly collection: string;
	abstract readonly id: string;

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
		return { action: "SET", collection: this.collection, id: this.id, data };
	}

	/** Get an update change for this item. */
	getUpdate(updates: Updates<T>): UpdateChange<T> {
		return { action: "UPDATE", collection: this.collection, id: this.id, updates };
	}

	/** Get a delete change for this item. */
	getDelete(): DeleteChange {
		return { action: "DELETE", collection: this.collection, id: this.id };
	}

	// Implement toString()
	toString(): string {
		return `${this.collection}/${this.id}`;
	}

	/** Subscribe to this item. */
	subscribe(onNext?: Dispatch<[ItemValue<T>]>, onError?: Handler): Stop {
		return runSequence(this, onNext, onError);
	}

	// Implement AsyncIterable
	[Symbol.asyncIterator](): AsyncIterator<ItemValue<T>> {
		return this.provider.getItemSequence(this.collection, this.id)[Symbol.asyncIterator]() as AsyncIterator<ItemValue<T>>;
	}
}

/** Reference to an item in a synchronous database. */
export class Item<T extends Data = Data> extends BaseItem<T> {
	readonly provider: Provider;
	readonly collection: string;
	readonly id: string;
	constructor(provider: Provider, collection: string, id: string) {
		super();
		this.provider = provider;
		this.collection = collection;
		this.id = id;
	}
	get exists(): boolean {
		return !!this.provider.getItem(this.collection, this.id);
	}
	get value(): ItemValue<T> {
		return this.provider.getItem(this.collection, this.id) as ItemValue<T>;
	}
	get data(): ItemData<T> {
		return getData(this.value);
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
export class AsyncItem<T extends Data = Data> extends BaseItem<T> {
	readonly provider: AsyncProvider;
	readonly collection: string;
	readonly id: string;
	constructor(provider: AsyncProvider, collection: string, id: string) {
		super();
		this.provider = provider;
		this.collection = collection;
		this.id = id;
	}
	get exists(): Promise<boolean> {
		return this.provider.getItem(this.collection, this.id).then(Boolean);
	}
	get value(): Promise<ItemValue<T>> {
		return this.provider.getItem(this.collection, this.id) as Promise<ItemValue<T>>;
	}
	get data(): Promise<ItemData<T>> {
		return this.value.then(getData);
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
