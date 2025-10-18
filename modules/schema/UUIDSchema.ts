import { getUUID } from "../util/uuid.js";
import { NULLABLE } from "./NullableSchema.js";
import { StringSchema, type StringSchemaOptions } from "./StringSchema.js";

/**
 * Type of `StringSchema` that defines a valid UUID (versions 1-5). Defaults to any-version validation.
 * - Input is trimmed and lowercased.
 * - Falsy values are converted to empty string.
 */
export class UUIDSchema extends StringSchema {
	constructor({ one = "UUID", title = "UUID", ...rest }: Omit<StringSchemaOptions, "input" | "min" | "max" | "match" | "multiline"> = {}) {
		super({
			one,
			title,
			...rest,
			min: 32,
			max: 36, // 36 chars including hyphens (which get stripped by sanitize for appearances).
		});
	}
	override sanitize(str: string): string {
		return getUUID(str) || "";
	}
}

/** Any valid UUID (versions 1-5) */
export const UUID = new UUIDSchema({ title: "ID" });

/** Any valid UUID (versions 1-5) or null */
export const NULLABLE_UUID = NULLABLE(UUID);
