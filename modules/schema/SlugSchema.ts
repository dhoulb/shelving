import { getSlug } from "../util/string.js";
import { NULLABLE } from "./NullableSchema.js";
import type { SchemaOptions } from "./Schema.js";
import { type StringInputType, StringSchema } from "./StringSchema.js";

/**
 * Options for a `SlugSchema`.
 *
 * - The length and single-line constraints are fixed internally, so only the presentation-level string options are exposed.
 *
 * @see https://dhoulb.github.io/shelving/schema/SlugSchema/SlugSchemaOptions
 */
export interface SlugSchemaOptions extends SchemaOptions {
	/** Default string value used when the input is `undefined`. */
	readonly value?: string | undefined;
	/**
	 * Maximum allowed character length.
	 * @default 32
	 */
	readonly max?: number | undefined;
	/** Regular expression the sanitized string must match. */
	readonly match?: RegExp | undefined;
	/** Force the result to `"upper"` or `"lower"` case. */
	readonly case?: "upper" | "lower" | undefined;
	/** HTML `<input />` `type=""` hint for downstream UIs. */
	readonly input?: StringInputType | undefined;
}

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
