import type { Data, PartialData } from "../util/data.js";
import { isData } from "../util/data.js";
import { formatObject } from "../util/format.js";
import type { Identifier, Item } from "../util/item.js";
import { type Key, omitProps, type Prop, pickProps, type Value } from "../util/object.js";
import { mapProps } from "../util/transform.js";
import { validateData } from "../util/validate.js";
import type { NullableSchema } from "./NullableSchema.js";
import { NULLABLE } from "./NullableSchema.js";
import { OPTIONAL } from "./OptionalSchema.js";
import type { SchemaOptions, Schemas } from "./Schema.js";
import { Schema } from "./Schema.js";

/**
 * Options for `DataSchema`.
 *
 * - `props` — a named schema for each property the data object must have.
 * - `value` — partial default value merged over the per-prop defaults.
 *
 * @see https://dhoulb.github.io/shelving/schema/DataSchema/DataSchemaOptions
 */
export interface DataSchemaOptions<T extends Data> extends SchemaOptions {
	readonly props: Schemas<T>;
	readonly value?: Partial<T> | undefined;
}

/**
 * Schema that validates a data object against a fixed set of named property schemas.
 *
 * - Each property is validated by its own schema in `props`.
 * - Excess keys are stripped and `undefined` outputs removed (via `validateData()`).
 *
 * @example
 *  const schema = new DataSchema({ props: { name: STRING, age: NUMBER } });
 *  schema.validate({ name: "Dave", age: 40 }); // { name: "Dave", age: 40 }
 *
 * @see https://dhoulb.github.io/shelving/schema/DataSchema/DataSchema
 */
export class DataSchema<T extends Data> extends Schema<unknown> {
	declare readonly value: T;
	readonly props: Schemas<T>;

	/**
	 * Create a new `DataSchema`.
	 *
	 * @param options Options for the schema, including the `props` schemas and an optional partial `value`.
	 */
	constructor({ one = "item", title = "Item", props, value: partialValue, ...options }: DataSchemaOptions<T>) {
		// Build default value from props and partial value.
		const value: T = { ...mapProps(props, _getSchemaValue), ...partialValue };
		super({ one, title, value, ...options });
		this.props = props;
	}

	/**
	 * Validate an unknown value as a data object matching this schema's props.
	 *
	 * @param unsafeValue The unknown input value to validate (defaults to this schema's `value`).
	 * @returns The valid data object with each property validated by its schema.
	 * @throws `string` `"Must be object"` if the value is not a data object, or a `"key: message"` line per invalid property.
	 * @example schema.validate({ name: "Dave" }) // { name: "Dave" }
	 * @see https://dhoulb.github.io/shelving/schema/DataSchema/DataSchema/validate
	 */
	override validate(unsafeValue: unknown = this.value): T {
		if (!isData(unsafeValue)) throw "Must be object";
		return validateData(unsafeValue, this.props);
	}

	/**
	 * Make a new `DataSchema` that only uses a defined subset of the current props.
	 *
	 * @param keys The property keys to keep.
	 * @returns A new `DataSchema` containing only the picked props.
	 * @example schema.pick("name", "age") // DataSchema<Pick<T, "name" | "age">>
	 * @see https://dhoulb.github.io/shelving/schema/DataSchema/DataSchema/pick
	 */
	pick<K extends Key<T>>(...keys: K[]): DataSchema<Pick<T, K>> {
		return new DataSchema<Pick<T, K>>({ ...this, props: pickProps<Schemas<T>, K>(this.props, ...keys) });
	}

	/**
	 * Make a new `DataSchema` that omits one or more of the current props.
	 *
	 * @param keys The property keys to remove.
	 * @returns A new `DataSchema` without the omitted props.
	 * @example schema.omit("age") // DataSchema<Omit<T, "age">>
	 * @see https://dhoulb.github.io/shelving/schema/DataSchema/DataSchema/omit
	 */
	omit<K extends Key<T>>(...keys: K[]): DataSchema<Omit<T, K>> {
		return new DataSchema<Omit<T, K>>({ ...this, props: omitProps<Schemas<T>, K>(this.props, ...keys) });
	}

	/**
	 * Format a validated data object as a string for display.
	 *
	 * @param value The valid data object to format.
	 * @returns The data object formatted as a human-readable string.
	 * @example schema.format({ name: "Dave" }) // "name: Dave"
	 * @see https://dhoulb.github.io/shelving/schema/DataSchema/DataSchema/format
	 */
	override format(value: T): string {
		return formatObject(value);
	}
}

function _getSchemaValue<T extends Data>([, { value }]: Prop<Schemas<T>>): Value<T> {
	return value as Value<T>;
}

/**
 * Create a `DataSchema` for a set of properties.
 *
 * *Sugar factory for [`DataSchema`](/schema/DataSchema).*
 *
 * @param props A named schema for each property of the data object.
 * @returns A `DataSchema` validating data with the given props.
 * @example DATA({ name: STRING, age: NUMBER }) // DataSchema<{ name: string; age: number }>
 * @see https://dhoulb.github.io/shelving/schema/DataSchema/DATA
 */
export function DATA<T extends Data>(props: Schemas<T>): DataSchema<T> {
	return new DataSchema({ props });
}

/**
 * Create a schema for a valid data object with specified properties, or `null`.
 *
 * *Sugar factory for [`NullableSchema`](/schema/NullableSchema).*
 *
 * @param props A named schema for each property of the data object.
 * @returns A `NullableSchema` wrapping a `DataSchema` with the given props.
 * @example NULLABLE_DATA({ name: STRING }) // NullableSchema<{ name: string }>
 * @see https://dhoulb.github.io/shelving/schema/DataSchema/NULLABLE_DATA
 */
export function NULLABLE_DATA<T extends Data>(props: Schemas<T>): NullableSchema<T> {
	return NULLABLE(new DataSchema({ props }));
}

/**
 * Create a `DataSchema` that validates partially, i.e. every property can be its value or `undefined`.
 *
 * *Sugar factory for [`DataSchema`](/schema/DataSchema).*
 *
 * @param source The props schemas or an existing `DataSchema` to make partial.
 * @returns A `DataSchema` whose every property is optional.
 * @example PARTIAL({ name: STRING, age: NUMBER }) // DataSchema<{ name?: string; age?: number }>
 * @see https://dhoulb.github.io/shelving/schema/DataSchema/PARTIAL
 */
export function PARTIAL<T extends Data>(source: Schemas<T> | DataSchema<T>): DataSchema<PartialData<T>>;
export function PARTIAL(source: Schemas<Data> | DataSchema<Data>): DataSchema<PartialData<Data>> {
	const props: Schemas<Data> = source instanceof DataSchema ? source.props : source;
	return new DataSchema<PartialData<Data>>({
		props: mapProps(props, _optionalProp),
	});
}
function _optionalProp([, v]: Prop<Schemas<Data>>): Schema<unknown> {
	return OPTIONAL(v);
}

/**
 * Create a `DataSchema` that validates a data item, i.e. it has a string or number `.id` identifier property.
 *
 * *Sugar factory for [`DataSchema`](/schema/DataSchema).*
 *
 * @param id Schema for the item's `id` identifier property.
 * @param schemas The props schemas or an existing `DataSchema` for the rest of the item.
 * @returns A `DataSchema` validating an item with an `id` property plus the given props.
 * @example ITEM(NUMBER, { name: STRING }) // DataSchema<{ id: number; name: string }>
 * @see https://dhoulb.github.io/shelving/schema/DataSchema/ITEM
 */
export function ITEM<I extends Identifier, T extends Data>(id: Schema<I>, schemas: Schemas<T> | DataSchema<T>): DataSchema<Item<I, T>> {
	const props: Schemas<T> = schemas instanceof DataSchema ? schemas.props : schemas;
	return new DataSchema<Item<I, T>>({
		props: { id, ...props } as Schemas<Item<I, T>>,
	});
}
