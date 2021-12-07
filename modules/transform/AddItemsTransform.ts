import { withItems, ImmutableArray, isArray } from "../util/index.js";
import { Transform } from "./Transform.js";

/** Add array item transform: an object that adds a specific item to an array. */
export class AddItemsTransform<T> extends Transform<ImmutableArray<T>> implements Iterable<T> {
	readonly items: ImmutableArray<T>;
	constructor(...items: ImmutableArray<T>) {
		super();
		this.items = items;
	}
	transform(existing?: unknown): ImmutableArray<T> {
		return isArray<ImmutableArray<T>>(existing) ? withItems(existing, this.items) : this.items;
	}

	/** Iterate over the items. */
	[Symbol.iterator](): Iterator<T, void> {
		return this.items.values();
	}
}
