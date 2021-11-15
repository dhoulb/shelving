import { ImmutableArray, isArray, withoutItems } from "../util/index.js";
import { Transform } from "./Transform.js";

/** Remove array item transform: an object that removes a specific item from an array. */
export class RemoveItemsTransform<T> extends Transform<ImmutableArray<T>> {
	readonly items: ImmutableArray<T>;
	constructor(...items: ImmutableArray<T>) {
		super();
		this.items = items;
	}
	transform(existing?: unknown): ImmutableArray<T> {
		return isArray<ImmutableArray<T>>(existing) ? withoutItems(existing, this.items) : this.items;
	}

	// Implement iterator protocol.
	*[Symbol.iterator](): Generator<T, void, undefined> {
		yield* this.items;
	}
}
