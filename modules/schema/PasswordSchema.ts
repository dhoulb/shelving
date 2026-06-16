import { StringSchema, type StringSchemaOptions } from "./StringSchema.js";

/**
 * Schema that defines a valid password string.
 *
 * - Defaults the `<input />` hint to `"password"`, but a caller can override it (e.g. `"text"` for a show-password toggle).
 * - Never formats the value for display (`format()` always returns `""`).
 *
 * @example new PasswordSchema({}).validate("hunter2"); // Returns "hunter2"
 * @see https://dhoulb.github.io/shelving/schema/PasswordSchema/PasswordSchema
 */
export class PasswordSchema extends StringSchema {
	/**
	 * Create a new `PasswordSchema`.
	 *
	 * @param options Options for the schema (inherits all `StringSchema` options).
	 * @param options.one Singular noun describing one value, used in error messages (defaults to `"password"`).
	 * @param options.title Title of the schema, e.g. for a corresponding field (defaults to `"Password"`).
	 * @param options.min Minimum allowed character length (defaults to `6`).
	 * @param options.input HTML `<input />` `type=""` hint (defaults to `"password"`).
	 */
	constructor({ one = "password", title = "Password", min = 6, input = "password", ...options }: StringSchemaOptions = {}) {
		super({ one, title, min, input, ...options });
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
