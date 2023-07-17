import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/** Allowed options for `BooleanSchema` */
export type BooleanSchemaOptions = SchemaOptions & {
	readonly value?: boolean | undefined;
};

/** Define a valid boolean. */
export class BooleanSchema extends Schema<boolean> {
	declare readonly value: boolean;
	constructor(options: BooleanSchemaOptions) {
		super({ value: false, ...options });
	}
	validate(unsafeValue: unknown = this.value): boolean {
		return !!unsafeValue;
	}
}

/** Valid boolean. */
export const BOOLEAN = new BooleanSchema({});
