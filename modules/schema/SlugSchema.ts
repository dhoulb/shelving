import { getSlug } from "../util/string.js";
import { OPTIONAL } from "./OptionalSchema.js";
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
			multiline: false,
		});
	}
	override sanitize(insaneString: string): string {
		return getSlug(insaneString);
	}
}

/** Valid slug, e.g. `this-is-a-slug` */
export const SLUG = new SlugSchema({});

/** Valid slug, e.g. `this-is-a-slug`, or `null` */
export const OPTIONAL_SLUG = OPTIONAL(SLUG);
