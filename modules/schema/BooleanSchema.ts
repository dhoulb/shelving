import { Schema, SchemaOptions } from "./Schema.js";

/** Allowed options for `BooleanSchema` */
export type BooleanSchemaOptions = SchemaOptions & {
	readonly value?: boolean | undefined;
};

/** Define a valid boolean. */
export class BooleanSchema extends Schema<boolean> {
	override readonly value: boolean;
	constructor({ value = false, ...options }: BooleanSchemaOptions) {
		super(options);
		this.value = value;
	}
	validate(unsafeValue: unknown = this.value): boolean {
		return !!unsafeValue;
	}
}

/** Valid boolean. */
export const BOOLEAN = new BooleanSchema({});
