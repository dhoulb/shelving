import { getSlug } from "../util/string.js";
import { NULLABLE } from "./NullableSchema.js";
import { StringSchema, type StringSchemaOptions } from "./StringSchema.js";

/**
 * Define a valid slug, e.g. `this-is-a-slug`
 *
 * - Useful for URL components, usernames, etc.
 * - Minimum slug length is 2 characters.
 * - Maximum slug length is 64 characters.
 */
export class SlugSchema extends StringSchema {
	constructor(options: Omit<StringSchemaOptions, "min" | "max" | "multiline">) {
		super({
			...options,
			min: 2,
			max: 32,
		});
	}
	override sanitize(str: string): string {
		return getSlug(str) || "";
	}
}

/** Valid slug, e.g. `this-is-a-slug` */
export const SLUG = new SlugSchema({});

/** Valid slug, e.g. `this-is-a-slug`, or `null` */
export const NULLABLE_SLUG = NULLABLE(SLUG);
