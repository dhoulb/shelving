import { Feedback } from "../feedback/Feedback.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/** Allowed options for `BooleanSchema` */
export interface BooleanSchemaOptions extends SchemaOptions {
	readonly value?: boolean | undefined;
	readonly required?: boolean | undefined;
}

const NEGATIVE = ["", "false", "0", "no", "n", "off"];

/** Define a valid boolean. */
export class BooleanSchema extends Schema<boolean> {
	declare readonly value: boolean;
	declare readonly required: boolean;
	constructor({ value = false, required = false, ...options }: BooleanSchemaOptions) {
		super({ value, ...options });
		this.required = required;
	}
	validate(unsafeValue: unknown = this.value): boolean {
		const value: boolean = typeof unsafeValue === "string" ? !NEGATIVE.includes(unsafeValue.toLowerCase().trim()) : !!unsafeValue;
		if (this.required) throw new Feedback("Required");
		return value;
	}
}

/** Valid boolean. */
export const BOOLEAN = new BooleanSchema({});
