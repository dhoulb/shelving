import { InvalidFeedback } from "../feedback";
import { RequiredOptions, Schema, SchemaOptions } from "./Schema";

export type BooleanOptions<T extends boolean> = SchemaOptions<T> & {
	readonly value?: boolean;
	readonly required?: boolean;
};

/**
 * Schema that defines a valid boolean.
 */
export class BooleanSchema<T extends boolean> extends Schema<T> {
	readonly value: boolean;

	constructor({ value = false, ...rest }: BooleanOptions<T>) {
		super(rest);
		this.value = value;
	}

	validate(unsafeValue: unknown = this.value): T {
		// Coorce.
		const value = !!unsafeValue;

		// Check requiredness.
		if (this.required && !value) throw new InvalidFeedback("Required", { value });

		// Return boolean.
		return super.validate(value);
	}
}

/** Shortcuts for BooleanSchema. */
export const boolean: {
	<T extends boolean>(options: BooleanOptions<T> & RequiredOptions): BooleanSchema<true>;
	<T extends boolean>(options: BooleanOptions<T>): BooleanSchema<boolean>;
	required: BooleanSchema<true>;
	optional: BooleanSchema<boolean>;
} = Object.assign(<T extends boolean>(options: BooleanOptions<T>): BooleanSchema<T> => new BooleanSchema<T>(options), {
	required: new BooleanSchema<true>({ required: true }),
	optional: new BooleanSchema<boolean>({ required: false }),
});
