import { Schema } from "./Schema.js";

/** Define a valid boolean. */
export class BooleanSchema extends Schema<boolean> {
	readonly value: boolean;
	constructor({
		value = false,
		...options
	}: ConstructorParameters<typeof Schema>[0] & {
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
