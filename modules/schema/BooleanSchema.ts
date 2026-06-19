import { formatBoolean } from "../util/format.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/**
 * Allowed options for `BooleanSchema`.
 *
 * @see https://dhoulb.github.io/shelving/schema/BooleanSchema/BooleanSchemaOptions
 */
export interface BooleanSchemaOptions extends SchemaOptions {
	/**
	 * Default boolean value used when the input is `undefined`.
	 * @default false
	 */
	readonly value?: boolean | undefined;
	/**
	 * When `true`, a falsy result is rejected as invalid.
	 * @default false
	 */
	readonly required?: boolean | undefined;
}

const NEGATIVE = ["", "false", "0", "no", "n", "off"];

/**
 * Schema that defines a valid boolean.
 *
 * - Strings are coerced: known negative strings (`""`, `"false"`, `"0"`, `"no"`, `"n"`, `"off"`) become `false`, everything else becomes `true`.
 * - All other values are coerced with standard truthiness.
 *
 * @example
 *  const schema = new BooleanSchema({ required: true });
 *  schema.validate("yes"); // Returns true
 *  schema.validate(""); // Throws "Required"
 *
 * @see https://dhoulb.github.io/shelving/schema/BooleanSchema/BooleanSchema
 */
export class BooleanSchema extends Schema<boolean> {
	declare readonly value: boolean;
	declare readonly required: boolean;
	/**
	 * Create a new `BooleanSchema`.
	 */
	constructor({ value = false, required = false, ...options }: BooleanSchemaOptions) {
		super({ value, ...options });
		this.required = required;
	}
	/**
	 * Validate an unknown value and coerce it to a boolean.
	 *
	 * @param unsafeValue Value to validate (defaults to this schema's `value`).
	 * @returns The coerced boolean value.
	 * @throws `string` `"Required"` if `required` is `true` and the coerced value is `false`.
	 *
	 * @example
	 *  BOOLEAN.validate("yes"); // Returns true
	 *
	 * @see https://dhoulb.github.io/shelving/schema/BooleanSchema/BooleanSchema/validate
	 */
	validate(unsafeValue: unknown = this.value): boolean {
		const value: boolean = typeof unsafeValue === "string" ? !NEGATIVE.includes(unsafeValue.toLowerCase().trim()) : !!unsafeValue;
		if (this.required && !value) throw "Required";
		return value;
	}
	/**
	 * Format a boolean value as a human-readable string for display.
	 *
	 * @param value Boolean value to format.
	 * @returns The formatted string, e.g. `"Yes"` or `"No"`.
	 *
	 * @example
	 *  BOOLEAN.format(true); // Returns "Yes"
	 *
	 * @see https://dhoulb.github.io/shelving/schema/BooleanSchema/BooleanSchema/format
	 */
	override format(value: boolean): string {
		return formatBoolean(value);
	}
}

/**
 * Sugar instance of `BooleanSchema` for a coerced boolean. Equivalent to `new BooleanSchema({})`.
 *
 * @example
 *  BOOLEAN.validate("yes"); // Returns true
 *
 * @see https://dhoulb.github.io/shelving/schema/BooleanSchema/BOOLEAN
 */
export const BOOLEAN = new BooleanSchema({});
