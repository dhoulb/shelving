import { ValueFeedback } from "../feedback/Feedback.js";
import type { Data, Database } from "../util/data.js";
import { isData } from "../util/data.js";
import type { Identifier, Item } from "../util/item.js";
import type { Prop } from "../util/object.js";
import { mapProps } from "../util/transform.js";
import type { Validator, Validators } from "../util/validate.js";
import { validateData } from "../util/validate.js";
import type { NullableSchema } from "./NullableSchema.js";
import { NULLABLE } from "./NullableSchema.js";
import { OPTIONAL } from "./OptionalSchema.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/** Allowed options for `PropsSchema` (a schema that has props). */
export interface DataSchemaOptions<T extends Data> extends SchemaOptions {
	readonly id?: Validator<string>;
	readonly props: Validators<T>;
	readonly value?: Partial<T> | undefined;
}

/** Validate a data object. */
export class DataSchema<T extends Data> extends Schema<unknown> {
	declare readonly value: Partial<T>;
	readonly props: Validators<T>;
	constructor({ props, title = "Data", value = {}, ...options }: DataSchemaOptions<T>) {
		super({ title, value, ...options });
		this.props = props;
	}
	override validate(unsafeValue: unknown = this.value): T {
		if (!isData(unsafeValue)) throw new ValueFeedback("Must be object", unsafeValue);
		return validateData(unsafeValue, this.props);
	}
}

/** Set of named data schemas. */
export type DataSchemas<T extends Database> = { [K in keyof T]: DataSchema<T[K]> };

/** Create a `DataSchema` for a set of properties. */
export const DATA = <T extends Data>(props: Validators<T>): DataSchema<T> => new DataSchema({ props });

/** Valid data object with specifed properties, or `null` */
export const NULLABLE_DATA = <T extends Data>(props: Validators<T>): NullableSchema<T> => NULLABLE(new DataSchema({ props }));

/** Create a `DataSchema` that validates partially, i.e. properties can be their value, or `undefined` */
export function PARTIAL<T extends Data>(source: Validators<T> | DataSchema<T>): DataSchema<Partial<T>>;
export function PARTIAL(source: Validators<Data> | DataSchema<Data>): DataSchema<Partial<Data>> {
	const props: Validators<Data> = source instanceof DataSchema ? source.props : source;
	return new DataSchema<Partial<Data>>({
		props: mapProps(props, _optionalProp),
	});
}
function _optionalProp([, v]: Prop<Validators<Data>>): Validator<unknown> {
	return OPTIONAL(v);
}

/** Create a `DataSchema` that validates a data item, i.e. it has a string or number `.id` identifier property. */
export function ITEM<I extends Identifier, T extends Data>(
	id: Validator<I>,
	validators: Validators<T> | DataSchema<T>,
): DataSchema<Item<I, T>> {
	const props: Validators<T> = validators instanceof DataSchema ? validators.props : validators;
	return new DataSchema<Item<I, T>>({
		props: { id, ...props } as Validators<Item<I, T>>,
	});
}
