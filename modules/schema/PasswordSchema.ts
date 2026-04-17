import { StringSchema, type StringSchemaOptions } from "./StringSchema.js";

export interface PasswordSchemaOptions extends Omit<StringSchemaOptions, "input"> {}

export class PasswordSchema extends StringSchema {
	constructor({ one = "password", title = "Password", min = 6, ...options }: PasswordSchemaOptions = {}) {
		super({ one, title, min, ...options, input: "password" });
	}
	override format(): string {
		return ""; // Never format a password for display.
	}
}

/** Password string. */
export const PASSWORD = new StringSchema({});
