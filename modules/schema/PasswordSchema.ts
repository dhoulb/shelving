import { StringSchema, type StringSchemaOptions } from "./StringSchema.js";

/**
 * Options for a `PasswordSchema`.
 *
 * @see https://dhoulb.github.io/shelving/schema/PasswordSchema/PasswordSchemaOptions
 */
export interface PasswordSchemaOptions extends Omit<StringSchemaOptions, "input"> {}

/**
 * Schema that defines a valid password string.
 *
 * - Forces the `<input />` hint to `"password"` for downstream UIs.
 * - Never formats the value for display (`format()` always returns `""`).
 *
 * @example new PasswordSchema({}).validate("hunter2"); // Returns "hunter2"
 * @see https://dhoulb.github.io/shelving/schema/PasswordSchema/PasswordSchema
 */
export class PasswordSchema extends StringSchema {
	/**
	 * Create a new `PasswordSchema`.
	 *
	 * @param options Options for the schema (inherits `StringSchema` options except `input`, which is fixed to `"password"`).
	 * @param options.one Singular noun describing one value, used in error messages (defaults to `"password"`).
	 * @param options.title Title of the schema, e.g. for a corresponding field (defaults to `"Password"`).
	 * @param options.min Minimum allowed character length (defaults to `6`).
	 */
	constructor({ one = "password", title = "Password", min = 6, ...options }: PasswordSchemaOptions = {}) {
		super({ one, title, min, ...options, input: "password" });
	}

	/**
	 * Format a password value for display (always returns `""`).
	 *
	 * - Passwords are never shown, so this deliberately yields an empty string.
	 *
	 * @returns An empty string.
	 * @example new PasswordSchema({}).format("hunter2"); // Returns ""
	 * @see https://dhoulb.github.io/shelving/schema/PasswordSchema/PasswordSchema/format
	 */
	override format(): string {
		return ""; // Never format a password for display.
	}
}

/**
 * Sugar instance of [`StringSchema`](/schema/StringSchema) for a password string. Equivalent to `new StringSchema({})`.
 *
 * @example PASSWORD.validate("hunter2"); // Returns "hunter2"
 * @see https://dhoulb.github.io/shelving/schema/PasswordSchema/PASSWORD
 */
export const PASSWORD = new StringSchema({});
