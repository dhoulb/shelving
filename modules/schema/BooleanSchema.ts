import { InvalidFeedback } from "../feedback";
import { RequiredOptions, Schema, SchemaOptions } from "./Schema";

export type BooleanOptions = SchemaOptions & {
	readonly value?: boolean;
	readonly required?: boolean;
};

/**
 * Schema that defines a valid boolean.
 */
export class BooleanSchema<T extends boolean> extends Schema<T> {
	readonly value: boolean;

	constructor({ value = false, ...rest }: BooleanOptions) {
		super(rest);
		this.value = value;
	}

	validate(unsafeValue: unknown = this.value): T {
		// Coorce.
		const value = !!unsafeValue;

		// Check requiredness.
		if (this.required && !value) throw new InvalidFeedback("Required");

		// Return boolean.
		return value as T;
	}
}

/** Shortcuts for BooleanSchema. */
export const boolean: {
	(options: BooleanOptions & RequiredOptions): BooleanSchema<true>;
	(options: BooleanOptions): BooleanSchema<boolean>;
	required: BooleanSchema<true>;
	optional: BooleanSchema<boolean>;
} = Object.assign(<T extends boolean>(options: BooleanOptions): BooleanSchema<T> => new BooleanSchema<T>(options), {
	required: new BooleanSchema<true>({ required: true }),
	optional: new BooleanSchema<boolean>({ required: false }),
});
