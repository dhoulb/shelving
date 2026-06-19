import { NULLABLE } from "./NullableSchema.js";
import { StringSchema, type StringSchemaOptions } from "./StringSchema.js";

const R_NOT_CHAR = /[^a-zA-Z0-9]/g;

/**
 * Schema that validates a database key string, stripping any non-alphanumeric characters.
 *
 * - Characters that are not a-z, A-Z, 0-9 are removed.
 * - Default minimum key length is 1 character.
 * - Default maximum key length is 32 characters.
 * - 32 characters is enough for UUIDs, as the 4 `-` hyphens are removed.
 *
 * @example
 *  const schema = new KeySchema({});
 *  schema.validate("a1b2-c3d4"); // "a1b2c3d4"
 *
 * @see https://dhoulb.github.io/shelving/schema/KeySchema/KeySchema
 */
export class KeySchema extends StringSchema {
	/**
	 * Create a new `KeySchema`.
	 */
	constructor({ one = "key", title = "Key", min = 1, max = 32, ...options }: StringSchemaOptions) {
		super({ one, title, min, max, ...options });
	}

	/**
	 * Sanitize the string by removing all characters that are not a-z, A-Z, or 0-9.
	 *
	 * @param str String to sanitize.
	 * @returns The sanitized key with non-alphanumeric characters removed.
	 * @example schema.sanitize("a1b2-c3d4") // "a1b2c3d4"
	 * @see https://dhoulb.github.io/shelving/schema/KeySchema/KeySchema/sanitize
	 */
	override sanitize(str: string): string {
		return str.replace(R_NOT_CHAR, "");
	}
}

/**
 * Sugar instance of `KeySchema` for a database key. Equivalent to `new KeySchema({ title: "ID" })`.
 *
 * @example KEY.validate("a1b2c3") // "a1b2c3"
 * @see https://dhoulb.github.io/shelving/schema/KeySchema/KEY
 */
export const KEY = new KeySchema({ title: "ID" });

/**
 * Sugar instance allowing a `KEY` or `null`. Equivalent to `NULLABLE(KEY)`.
 *
 * @example NULLABLE_KEY.validate("") // null
 * @see https://dhoulb.github.io/shelving/schema/KeySchema/NULLABLE_KEY
 */
export const NULLABLE_KEY = NULLABLE(KEY);
