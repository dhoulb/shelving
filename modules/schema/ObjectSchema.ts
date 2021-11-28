import { ImmutableObject, Validator, isObject, validateValues } from "../util/index.js";
import { InvalidFeedback } from "../feedback/index.js";
import { Schema } from "./Schema.js";

/** Validate a map-like object (whose props are all the same). */
export class ObjectSchema<T> extends Schema<ImmutableObject<T>> {
	readonly value: ImmutableObject;
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
		readonly required?: boolean;
		readonly min?: number | null;
		readonly max?: number | null;
	}) {
		super(rest);
		this.value = value;
		this.items = items;
		this.min = min;
		this.max = max;
	}
	override validate(unsafeValue: unknown = this.value): ImmutableObject<T> {
		if (!isObject(unsafeValue)) throw new InvalidFeedback("Must be object", { value: unsafeValue });
		const unsafeEntries = Object.entries(unsafeValue);
		const safeObject = Object.fromEntries(validateValues(unsafeEntries, this.items));
		if (typeof this.min === "number" && unsafeEntries.length < this.min) throw new InvalidFeedback(`Minimum ${this.min} items`, { value: safeObject });
		if (typeof this.max === "number" && unsafeEntries.length > this.max) throw new InvalidFeedback(`Maximum ${this.max} items`, { value: safeObject });
		return safeObject;
	}
}

/** Valid map-like object with specifed items. */
export const OBJECT = <T>(items: Validator<T>): ObjectSchema<T> => new ObjectSchema({ items });
