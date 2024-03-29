import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/** Allowed options for `BooleanSchema` */
export interface BooleanSchemaOptions extends SchemaOptions {
	readonly value?: boolean | undefined;
}

/** Define a valid boolean. */
export class BooleanSchema extends Schema<boolean> {
	declare readonly value: boolean;
	constructor({ value = false, ...options }: BooleanSchemaOptions) {
		super({ value, ...options });
	}
	validate(unsafeValue: unknown = this.value): boolean {
		return !!unsafeValue;
	}
}

/** Valid boolean. */
export const BOOLEAN = new BooleanSchema({});
