import type { Data, Datas } from "../util/data.js";
import { InvalidFeedback } from "../feedback/InvalidFeedback.js";
import { validateData, Validators } from "../util/validate.js";
import { isData } from "../util/data.js";
import { OPTIONAL, OptionalSchema } from "./OptionalSchema.js";
import { Schema, SchemaOptions } from "./Schema.js";

/** Allowed options for `DataSchema` */
export type DataSchemaOptions<T extends Data> = SchemaOptions & {
	readonly props: Validators<T>;
	readonly value?: Partial<T>;
};

/** Validate a data object. */
export class DataSchema<T extends Data> extends Schema<T> {
	override readonly value: Partial<T>;
	readonly props: Validators<T>;
	constructor({ value = {}, props, ...options }: DataSchemaOptions<T>) {
		super(options);
		this.props = props;
		this.value = value;
	}
	override validate(unsafeValue: unknown = this.value): T {
		if (!isData(unsafeValue)) throw new InvalidFeedback("Must be object", { value: unsafeValue });
		return validateData(unsafeValue, this.props);
	}
}

/** Set of named data schemas. */
export type DataSchemas<T extends Datas> = { [K in keyof T]: DataSchema<T[K]> };

/** Valid data object with specifed properties. */
export const DATA = <T extends Data>(props: Validators<T>): DataSchema<T> => new DataSchema({ props });

/** Valid data object with specifed properties, or `null` */
export const OPTIONAL_DATA = <T extends Data>(props: Validators<T>): OptionalSchema<T> => OPTIONAL(new DataSchema({ props }));
