import { StringSchema, type StringSchemaOptions } from "./StringSchema.js";

/**
 * Schema that defines a valid password string.
 *
 * - Defaults the `<input />` hint to `"password"`, but a caller can override it (e.g. `"text"` for a show-password toggle).
 * - Formats the value unchanged (like `StringSchema`) so a password `<input />` can hold and mask it — hiding the value is the input's job, not the schema's.
 *
 * @example new PasswordSchema({}).validate("hunter2"); // Returns "hunter2"
 * @see https://shelving.cc/schema/PasswordSchema
 */
export class PasswordSchema extends StringSchema {
	constructor({ one = "password", title = "Password", min = 6, input = "password", ...options }: StringSchemaOptions = {}) {
		super({ one, title, min, input, ...options });
	}
}

/**
 * Sugar instance of `PasswordSchema` for a password string. Equivalent to `new PasswordSchema({})`.
 *
 * @example PASSWORD.validate("hunter2"); // Returns "hunter2"
 * @see https://shelving.cc/schema/PASSWORD
 */
export const PASSWORD = new PasswordSchema({});
