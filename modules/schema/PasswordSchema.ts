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
 * Sugar instance of [`PasswordSchema`](/schema/PasswordSchema) for a password string. Equivalent to `new PasswordSchema({})`.
 *
 * @example PASSWORD.validate("hunter2"); // Returns "hunter2"
 * @see https://dhoulb.github.io/shelving/schema/PasswordSchema/PASSWORD
 */
export const PASSWORD = new PasswordSchema({});
