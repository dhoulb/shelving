import { getUUID } from "../util/uuid.js";
import { NULLABLE } from "./NullableSchema.js";
import { StringSchema, type StringSchemaOptions } from "./StringSchema.js";

/**
 * Type of `StringSchema` that defines a valid UUID (versions 1-5). Defaults to any-version validation.
 * - Input is trimmed and lowercased.
 * - Falsy values are converted to empty string.
 */
export class UUIDSchema extends StringSchema {
	constructor(options: StringSchemaOptions = {}) {
		const { title = "UUID", ...rest } = options;
		super({
			title,
			...rest,
			min: 36,
			max: 36, // 36 chars including hyphens
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
