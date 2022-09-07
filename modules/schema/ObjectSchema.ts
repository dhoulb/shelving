import { ImmutableObject, isObject } from "../util/object.js";
import { Validator, validateEntries } from "../util/validate.js";
import { InvalidFeedback } from "../feedback/InvalidFeedback.js";
import { Schema } from "./Schema.js";

/** Validate a map-like object (whose props are all the same). */
export class ObjectSchema<T> extends Schema<ImmutableObject<T>> {
	override readonly value: ImmutableObject;
	readonly items: Validator<T>;
	readonly min: number | null = null;
	readonly max: number | null = null;
	constructor({
		value = {},
		items,
		min = null,
		max = null,
		...rest
	}: ConstructorParameters<typeof Schema>[0] & {
		readonly items: Validator<T>;
		readonly value?: ImmutableObject;
		readonly min?: number | null;
		readonly max?: number | null;
	}) {
		super(rest);
		this.items = items;
		this.value = value;
		this.min = min;
		this.max = max;
	}
	override validate(unsafeValue: unknown = this.value): ImmutableObject<T> {
		if (!isObject(unsafeValue)) throw new InvalidFeedback("Must be object", { value: unsafeValue });
		const unsafeEntries = Object.entries(unsafeValue);
		const safeObject = Object.fromEntries(validateEntries(unsafeEntries, this.items));
		if (typeof this.min === "number" && unsafeEntries.length < this.min) throw new InvalidFeedback(unsafeEntries.length ? `Minimum ${this.min} items` : "Required", { value: safeObject });
		if (typeof this.max === "number" && unsafeEntries.length > this.max) throw new InvalidFeedback(`Maximum ${this.max} items`, { value: safeObject });
		return safeObject;
	}
}

/** Valid map-like object with specifed items. */
export const OBJECT = <T>(items: Validator<T>): ObjectSchema<T> => new ObjectSchema({ items });
