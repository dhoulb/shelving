import { ImmutableMap, Validator, validateValues, toMap, isObject } from "../util/index.js";
import { InvalidFeedback } from "../feedback/index.js";
import { Schema } from "./Schema.js";

/** Validate a `Map` instance. */
export class MapSchema<T> extends Schema<ImmutableMap<T>> {
	static from<X>(items: Validator<X>): MapSchema<X> {
		return new MapSchema({ items });
	}
	readonly value: ImmutableMap;
	readonly items: Validator<T>;
	readonly min: number | null = null;
	readonly max: number | null = null;
	constructor({
		value = new Map(),
		items,
		min = null,
		max = null,
		...rest
	}: ConstructorParameters<typeof Schema>[0] & {
		readonly items: Validator<T>;
		readonly value?: ImmutableMap;
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
	override validate(unsafeValue: unknown = this.value): ImmutableMap<T> {
		const unsafeMap = !unsafeValue ? new Map() : isObject(unsafeValue) ? toMap(unsafeValue) : unsafeValue;
		if (!(unsafeMap instanceof Map)) throw new InvalidFeedback("Must be map", { value: unsafeValue });
		const safeMap = new Map(validateValues(unsafeMap, this.items));
		if (typeof this.min === "number" && safeMap.size < this.min) throw new InvalidFeedback(`Minimum ${this.min} items`, { value: safeMap });
		if (typeof this.max === "number" && safeMap.size > this.max) throw new InvalidFeedback(`Maximum ${this.max} items`, { value: safeMap });
		return safeMap;
	}
}

/** Valid map with specifed items. */
export const MAP = <X>(items: Validator<X>): MapSchema<X> => new MapSchema({ items });
