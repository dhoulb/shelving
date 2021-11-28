import { ImmutableArray, isArray, withoutItems } from "../util/index.js";
import { Transform } from "./Transform.js";

/** Remove array item transform: an object that removes a specific item from an array. */
export class RemoveItemsTransform<T> extends Transform<ImmutableArray<T>> implements Iterable<T> {
	readonly items: ImmutableArray<T>;
	constructor(...items: ImmutableArray<T>) {
		super();
		this.items = items;
	}
	derive(existing?: ImmutableArray<T> | unknown): ImmutableArray<T> {
		return isArray<ImmutableArray<T>>(existing) ? withoutItems(existing, this.items) : this.items;
	}

	/** Iterate over the items. */
	[Symbol.iterator](): Iterator<T, void> {
		return this.items.values();
	}
}
