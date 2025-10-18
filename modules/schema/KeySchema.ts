import { NULLABLE } from "./NullableSchema.js";
import { StringSchema, type StringSchemaOptions } from "./StringSchema.js";

const R_NOT_CHAR = /[^a-zA-Z0-9]/g;

/**
 * Define a valid database key.
 *
 * - Characters that are not a-z, A-Z, 0-9 are removed.
 * - Default minimum key length is 1 character.
 * - Default maximum key length is 32 characters.
 * - 32 characters is enough for UUIDs, as the 4 `-` hyphens are removed.
 */
export class KeySchema extends StringSchema {
	constructor({ one = "key", min = 1, max = 32, ...options }: StringSchemaOptions) {
		super({ one, min, max, ...options });
	}
	override sanitize(str: string): string {
		return str.replace(R_NOT_CHAR, "");
	}
}

/** Valid database key. */
export const KEY = new KeySchema({ title: "ID" });

/** Valid optional database key. */
export const NULLABLE_KEY = NULLABLE(KEY);
