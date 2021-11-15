import { withItems, ImmutableArray, isArray } from "../util/index.js";
import { Transform } from "./Transform.js";

/** Add array item transform: an object that adds a specific item to an array. */
export class AddItemsTransform<T> extends Transform<ImmutableArray<T>> {
	readonly items: ImmutableArray<T>;
	constructor(...items: ImmutableArray<T>) {
		super();
		this.items = items;
	}
	transform(existing?: unknown): ImmutableArray<T> {
		return isArray<ImmutableArray<T>>(existing) ? withItems(existing, this.items) : this.items;
	}

	// Implement iterator protocol.
	*[Symbol.iterator](): Generator<T, void, undefined> {
		yield* this.items;
	}
}
