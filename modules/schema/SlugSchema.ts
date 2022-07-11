import { getSlug } from "../util/string.js";
import { OPTIONAL } from "./OptionalSchema.js";
import { StringSchema } from "./StringSchema.js";

/**
 * Define a valid slug, e.g. `this-is-a-slug`
 *
 * - Useful for URL components, usernames, etc.
 * - Minimum slug length is 2 characters.
 * - Maximum slug length is 64 characters.
 */
export class SlugSchema extends StringSchema {
	override readonly multiline = false;
	override readonly min = 2;
	override readonly max = 32;
	override sanitize(unsafeString: string): string {
		return getSlug(unsafeString);
	}
}

/** Valid slug, e.g. `this-is-a-slug` */
export const SLUG = new SlugSchema({});

/** Valid slug, e.g. `this-is-a-slug`, or `null` */
export const OPTIONAL_SLUG = OPTIONAL(SLUG);
