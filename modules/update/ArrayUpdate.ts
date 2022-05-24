import { ImmutableArray, isArray, withItems, withoutItems } from "../util/array.js";
import { Update } from "./Update.js";

/** Update that can be applied to an array to add/remove items. */
export class ArrayUpdate<T> extends Update<ImmutableArray<T>> {
	/** Return an array update with an item marked for addition. */
	static with<X>(...adds: X[]): ArrayUpdate<X> {
		return new ArrayUpdate<X>(adds);
	}

	/** Return an array update with an item marked for deletion. */
	static without<X>(...deletes: X[]): ArrayUpdate<X> {
		return new ArrayUpdate([], deletes);
	}

	readonly adds: ImmutableArray<T>;
	readonly deletes: ImmutableArray<T>;
	constructor(adds: ImmutableArray<T> = [], deletes: ImmutableArray<T> = []) {
		super();
		this.adds = adds;
		this.deletes = deletes;
	}
	transform(existing: unknown): ImmutableArray<T> {
		const existingArray = isArray<ImmutableArray<T>>(existing) ? existing : [];
		return withoutItems(withItems(existingArray, this.adds), this.deletes);
	}

	/** Return an array update with an additional item marked for addition. */
	with(...adds: T[]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, adds: [...this.adds, ...adds] };
	}

	/** Return an array update with an additional item marked for deletion. */
	without(...deletes: T[]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, deletes: [...this.deletes, ...deletes] };
	}
}
