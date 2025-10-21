import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/** Allowed options for `BooleanSchema` */
export interface BooleanSchemaOptions extends SchemaOptions {
	readonly value?: boolean | undefined;
}

const NEGATIVE = ["", "false", "0", "no", "n", "off"];

/** Define a valid boolean. */
export class BooleanSchema extends Schema<boolean> {
	declare readonly value: boolean;
	constructor({ value = false, ...options }: BooleanSchemaOptions) {
		super({ value, ...options });
	}
	validate(unsafeValue: unknown = this.value): boolean {
		if (typeof unsafeValue === "string") return !NEGATIVE.includes(unsafeValue.toLowerCase().trim());
		return !!unsafeValue;
	}
}

/** Valid boolean. */
export const BOOLEAN = new BooleanSchema({});
