import { getSlug } from "../util/string.js";
import { NULLABLE } from "./NullableSchema.js";
import { StringSchema, type StringSchemaOptions } from "./StringSchema.js";

/**
 * Options for a [`SlugSchema`](/schema/SlugSchema).
 *
 * Inherits [`StringSchemaOptions`](/schema/StringSchema/StringSchemaOptions) except `min` and `rows`, which are fixed because the slug format is enforced internally.
 *
 * @see https://dhoulb.github.io/shelving/schema/SlugSchema/SlugSchemaOptions
 */
export interface SlugSchemaOptions extends Omit<StringSchemaOptions, "min" | "rows"> {}

/**
 * Schema that defines a valid slug, e.g. `this-is-a-slug`.
 *
 * - Useful for URL components, usernames, etc.
 * - Input is sanitized into a lowercase, hyphen-separated slug.
 * - Slugs are limited to 32 characters.
 *
 * @example
 * 	const schema = new SlugSchema({});
 * 	schema.validate("This is a Slug!") // "this-is-a-slug"
 * @see https://dhoulb.github.io/shelving/schema/SlugSchema/SlugSchema
 */
export class SlugSchema extends StringSchema {
	/**
	 * Create a new `SlugSchema`.
	 *
	 * @param options Options for the schema (inherited string options like `one`, `title`, `value`).
	 */
	constructor({ max = 32, ...options }: SlugSchemaOptions) {
		super({
			...options,
			max,
			min: 1,
			rows: 1,
		});
	}

	/**
	 * Sanitize a string before validation by converting it into a slug.
	 *
	 * @param str The raw string to sanitize.
	 * @returns The sanitized slug, or an empty string when nothing usable remains.
	 * @example schema.sanitize("This is a Slug!") // "this-is-a-slug"
	 * @see https://dhoulb.github.io/shelving/schema/SlugSchema/SlugSchema/sanitize
	 */
	override sanitize(str: string): string {
		return getSlug(str) || "";
	}
}

/**
 * Sugar instance of [`SlugSchema`](/schema/SlugSchema) for a valid slug. Equivalent to `new SlugSchema({})`.
 *
 * @example SLUG.validate("This is a Slug!") // "this-is-a-slug"
 * @see https://dhoulb.github.io/shelving/schema/SlugSchema/SLUG
 */
export const SLUG = new SlugSchema({});

/**
 * Sugar instance allowing a [`SLUG`](/schema/SLUG) or `null`. Equivalent to `NULLABLE(SLUG)`.
 *
 * @example NULLABLE_SLUG.validate(null) // null
 * @see https://dhoulb.github.io/shelving/schema/SlugSchema/NULLABLE_SLUG
 */
export const NULLABLE_SLUG = NULLABLE(SLUG);
