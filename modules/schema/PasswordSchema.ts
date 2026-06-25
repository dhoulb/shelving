import { StringSchema, type StringSchemaOptions } from "./StringSchema.js";

/**
 * Schema that defines a valid password string.
 *
 * - Defaults the `<input />` hint to `"password"`, but a caller can override it (e.g. `"text"` for a show-password toggle).
 * - Never formats the value for display (`format()` always returns `""`).
 *
 * @example new PasswordSchema({}).validate("hunter2"); // Returns "hunter2"
 * @see https://shelving.cc/schema/PasswordSchema
 */
export class PasswordSchema extends StringSchema {
	constructor({ one = "password", title = "Password", min = 6, input = "password", ...options }: StringSchemaOptions = {}) {
		super({ one, title, min, input, ...options });
	}

	/** Always returns `""` — passwords are never shown. */
	override format(): string {
		return ""; // Never format a password for display.
	}
}

/**
 * Sugar instance of `PasswordSchema` for a password string. Equivalent to `new PasswordSchema({})`.
 *
 * @example PASSWORD.validate("hunter2"); // Returns "hunter2"
 * @see https://shelving.cc/schema/PASSWORD
 */
export const PASSWORD = new PasswordSchema({});
