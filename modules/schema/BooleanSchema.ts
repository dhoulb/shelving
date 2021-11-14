import { InvalidFeedback } from "../util/index.js";
import { Schema, SchemaOptions } from "./Schema.js";

type BooleanSchemaOptions<T extends boolean> = SchemaOptions<T> & {
	readonly value?: boolean;
};

/**
 * Schema that defines a valid boolean.
 */
export class BooleanSchema<T extends boolean> extends Schema<T> {
	static REQUIRED: BooleanSchema<true> = new BooleanSchema({ required: true });
	static OPTIONAL: BooleanSchema<boolean> = new BooleanSchema({ required: false });

	static create(options: BooleanSchemaOptions<boolean> & { required: true }): BooleanSchema<true>;
	static create(options: BooleanSchemaOptions<boolean>): BooleanSchema<boolean>;
	static create(options: BooleanSchemaOptions<boolean>): BooleanSchema<boolean> {
		return new BooleanSchema(options);
	}

	override readonly value: boolean;

	protected constructor({ value = false, ...rest }: BooleanSchemaOptions<T>) {
		super(rest);
		this.value = value;
	}

	override validate(unsafeValue: unknown = this.value): T {
		// Coorce.
		const value = !!unsafeValue;

		// Check requiredness.
		if (this.required && !value) throw new InvalidFeedback("Required", { value });

		// Return boolean.
		return super.validate(value);
	}
}
