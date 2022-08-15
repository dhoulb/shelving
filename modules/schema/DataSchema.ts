import type { Data, Datas } from "../util/data.js";
import { InvalidFeedback } from "../feedback/InvalidFeedback.js";
import { validateData, Validators } from "../util/validate.js";
import { isObject } from "../util/object.js";
import { OPTIONAL, OptionalSchema } from "./OptionalSchema.js";
import { Schema } from "./Schema.js";

/** Validate a data object. */
export class DataSchema<T extends Data> extends Schema<T> {
	readonly props: Validators<T>;
	readonly value: Partial<T>;
	constructor({
		value = {},
		props,
		...options
	}: ConstructorParameters<typeof Schema>[0] & {
		readonly props: Validators<T>;
		readonly value?: Partial<T>;
	}) {
		super(options);
		this.props = props;
		this.value = value;
	}
	override validate(unsafeValue: unknown = this.value): T {
		if (!isObject(unsafeValue)) throw new InvalidFeedback("Must be object", { value: unsafeValue });
		return validateData(unsafeValue, this.props);
	}
}

/** Set of named data schemas. */
export type DataSchemas<T extends Datas> = { [K in keyof T]: DataSchema<T[K]> };

/** Valid data object with specifed properties. */
export const DATA = <T extends Data>(props: Validators<T>): DataSchema<T> => new DataSchema({ props });

/** Valid data object with specifed properties, or `null` */
export const OPTIONAL_DATA = <T extends Data>(props: Validators<T>): OptionalSchema<T> => OPTIONAL(new DataSchema({ props }));
