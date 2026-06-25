import { getUUID } from "../util/uuid.js";
import { NULLABLE } from "./NullableSchema.js";
import type { SchemaOptions } from "./Schema.js";
import { type StringInputType, StringSchema } from "./StringSchema.js";

/**
 * Options for a `UUIDSchema`.
 *
 * - The length, format, and single-line constraints are fixed internally, so only the presentation-level string options are exposed.
 *
 * @see https://shelving.cc/schema/UUIDSchemaOptions
 */
export interface UUIDSchemaOptions extends SchemaOptions {
	/** Default string value used when the input is `undefined`. */
	readonly value?: string | undefined;
	/**
	 * Maximum allowed character length.
	 * @default 36
	 */
	readonly max?: number | undefined;
	/** Force the result to `"upper"` or `"lower"` case. */
	readonly case?: "upper" | "lower" | undefined;
	/** HTML `<input />` `type=""` hint for downstream UIs. */
	readonly input?: StringInputType | undefined;
}

/**
 * Schema that defines a valid UUID string (versions 1-5). Defaults to any-version validation.
 *
 * - Input is trimmed and lowercased.
 * - Falsy values are converted to an empty string.
 *
 * @example
 * 	const schema = new UUIDSchema({});
 * 	schema.validate("F47AC10B-58CC-4372-A567-0E02B2C3D479") // "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 * @see https://shelving.cc/schema/UUIDSchema
 */
export class UUIDSchema extends StringSchema {
	constructor({ one = "UUID", title = "UUID", max = 36, ...rest }: UUIDSchemaOptions = {}) {
		super({
			one,
			title,
			...rest,
			max, // 36 chars including hyphens (which get stripped by sanitize for appearances).
			min: 32,
			rows: 1,
		});
	}

	/** Normalises the input into a canonical lowercase UUID (or `""` if not a valid UUID). */
	override sanitize(str: string): string {
		return getUUID(str) || "";
	}
}

/**
 * Sugar instance of `UUIDSchema` for any valid UUID (versions 1-5). Equivalent to `new UUIDSchema({ title: "ID" })`.
 *
 * @example UUID.validate("F47AC10B-58CC-4372-A567-0E02B2C3D479") // "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 * @see https://shelving.cc/schema/UUID
 */
export const UUID = new UUIDSchema({ title: "ID" });

/**
 * Sugar instance allowing a `UUID` or `null`. Equivalent to `NULLABLE(UUID)`.
 *
 * @example NULLABLE_UUID.validate(null) // null
 * @see https://shelving.cc/schema/NULLABLE_UUID
 */
export const NULLABLE_UUID = NULLABLE(UUID);
