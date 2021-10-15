import { InvalidFeedback } from "../feedback/index.js";
import { RequiredSchemaOptions, Schema, SchemaOptions } from "./Schema.js";

type BooleanSchemaOptions<T extends boolean> = SchemaOptions<T> & {
	readonly value?: boolean;
	readonly required?: boolean;
};

/**
 * Schema that defines a valid boolean.
 */
export class BooleanSchema<T extends boolean> extends Schema<T> {
	static REQUIRED: BooleanSchema<true> = new BooleanSchema({ required: true });
	static OPTIONAL: BooleanSchema<boolean> = new BooleanSchema({ required: false });

	static create(options: BooleanSchemaOptions<boolean> & RequiredSchemaOptions): BooleanSchema<true>;
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
