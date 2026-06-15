import { getUUID } from "../util/uuid.js";
import { NULLABLE } from "./NullableSchema.js";
import { StringSchema, type StringSchemaOptions } from "./StringSchema.js";

/**
 * Schema that defines a valid UUID string (versions 1-5). Defaults to any-version validation.
 *
 * - Input is trimmed and lowercased.
 * - Falsy values are converted to an empty string.
 *
 * @example
 * 	const schema = new UUIDSchema({});
 * 	schema.validate("F47AC10B-58CC-4372-A567-0E02B2C3D479") // "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 * @see https://dhoulb.github.io/shelving/schema/UUIDSchema/UUIDSchema
 */
export class UUIDSchema extends StringSchema {
	/**
	 * Create a new `UUIDSchema`.
	 *
	 * @param options Options for the schema (inherited string options like `one`, `title`, `value`).
	 */
	constructor({ one = "UUID", title = "UUID", ...rest }: Omit<StringSchemaOptions, "input" | "min" | "max" | "match" | "rows"> = {}) {
		super({
			one,
			title,
			...rest,
			min: 32,
			max: 36, // 36 chars including hyphens (which get stripped by sanitize for appearances).
			rows: 1,
		});
	}

	/**
	 * Sanitize a string before validation by normalising it into a canonical UUID.
	 *
	 * @param str The raw string to sanitize.
	 * @returns The sanitized UUID, or an empty string when the input is not a valid UUID.
	 * @example schema.sanitize("F47AC10B58CC4372A5670E02B2C3D479") // "f47ac10b-58cc-4372-a567-0e02b2c3d479"
	 * @see https://dhoulb.github.io/shelving/schema/UUIDSchema/UUIDSchema/sanitize
	 */
	override sanitize(str: string): string {
		return getUUID(str) || "";
	}
}

/**
 * Sugar instance of [`UUIDSchema`](/schema/UUIDSchema) for any valid UUID (versions 1-5). Equivalent to `new UUIDSchema({ title: "ID" })`.
 *
 * @example UUID.validate("F47AC10B-58CC-4372-A567-0E02B2C3D479") // "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 * @see https://dhoulb.github.io/shelving/schema/UUIDSchema/UUID
 */
export const UUID = new UUIDSchema({ title: "ID" });

/**
 * Sugar instance allowing a [`UUID`](/schema/UUID) or `null`. Equivalent to `NULLABLE(UUID)`.
 *
 * @example NULLABLE_UUID.validate(null) // null
 * @see https://dhoulb.github.io/shelving/schema/UUIDSchema/NULLABLE_UUID
 */
export const NULLABLE_UUID = NULLABLE(UUID);
