import { Schema, SchemaOptions } from "./Schema.js";

/** Define a valid boolean. */
export class BooleanSchema extends Schema<boolean> {
	override readonly value: boolean;
	constructor({
		value = false,
		...options
	}: SchemaOptions & {
		readonly value?: boolean;
	}) {
		super(options);
		this.value = value;
	}
	validate(unsafeValue: unknown = this.value): boolean {
		return !!unsafeValue;
	}
}

/** Valid boolean. */
export const BOOLEAN = new BooleanSchema({});
