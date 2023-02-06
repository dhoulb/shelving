import { ArraySchema } from "../schema/ArraySchema.js";
import { ImmutableArray, withArrayItems, omitArrayItems } from "../util/array.js";
import { getPrototype } from "../util/object.js";
import { validateArray, Validator } from "../util/validate.js";
import { Update } from "./Update.js";

/** Update that can be applied to an array to add/remove items. */
export class ArrayUpdate<T> extends Update<ImmutableArray<T>> {
	/** Return an array update with an item marked for addition. */
	static add<X>(...adds: X[]): ArrayUpdate<X> {
		return new ArrayUpdate<X>(adds);
	}

	/** Return an array update with an item marked for deletion. */
	static delete<X>(...deletes: X[]): ArrayUpdate<X> {
		return new ArrayUpdate([], deletes);
	}

	readonly adds: ImmutableArray<T>;
	readonly deletes: ImmutableArray<T>;
	constructor(adds: ImmutableArray<T> = [], deletes: ImmutableArray<T> = []) {
		super();
		this.adds = adds;
		this.deletes = deletes;
	}

	/** Return an array update with an additional item marked for addition. */
	add(...adds: T[]): this {
		return {
			__proto__: getPrototype(this),
			...this,
			adds: [...this.adds, ...adds],
		};
	}

	/** Return an array update with an additional item marked for deletion. */
	delete(...deletes: T[]): this {
		return {
			__proto__: getPrototype(this),
			...this,
			deletes: [...this.deletes, ...deletes],
		};
	}

	// Implement `Transformable`
	transform(arr: ImmutableArray<T> = []): ImmutableArray<T> {
		return omitArrayItems(withArrayItems(arr, ...this.adds), ...this.deletes);
	}

	// Implement `Validatable`
	override validate(validator: ArraySchema<T> | Validator<ImmutableArray<T>>): this {
		if (!(validator instanceof ArraySchema)) return super.validate(validator);
		return {
			__proto__: getPrototype(this),
			...this,
			adds: validateArray(this.adds, validator.items),
			deletes: validateArray(this.deletes, validator.items),
		};
	}
}
