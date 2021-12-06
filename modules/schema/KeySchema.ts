import { StringSchema } from "./StringSchema.js";
import { OPTIONAL } from "./OptionalSchema.js";

/**
 * Define a valid database key.
 *
 * - Minimum key length is 1 character.
 * - Maximum key length is 64 characters.
 */
export class KeySchema extends StringSchema {
	override readonly multiline = false;
	override readonly min = 1;
	override readonly max = 64;
}

/** Valid color hex string, e.g. `#00CCFF` (required because empty string is invalid). */
export const KEY = new KeySchema({});

/** Valid color hex string, e.g. `#00CCFF`, or `null` */
export const OPTIONAL_KEY = OPTIONAL(KEY);
