import { OPTIONAL } from "./OptionalSchema.js";
import { StringSchema, type StringSchemaOptions } from "./StringSchema.js";

/**
 * Define a valid database key.
 *
 * - Default minimum key length is 1 character.
 * - Default maximum key length is 64 characters.
 */
export class KeySchema extends StringSchema {
	constructor({ min = 1, max = 64, ...options }: StringSchemaOptions) {
		super({ min, max, ...options });
	}
}

/** Valid color hex string, e.g. `#00CCFF` (required because empty string is invalid). */
export const KEY = new KeySchema({});

/** Valid color hex string, e.g. `#00CCFF`, or `null` */
export const OPTIONAL_KEY = OPTIONAL(KEY);
