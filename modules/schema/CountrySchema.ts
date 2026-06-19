import { COUNTRIES, type Country, getCountry, type PossibleCountry } from "../util/geo.js";
import { ChoiceSchema } from "./ChoiceSchema.js";
import { NULLABLE } from "./NullableSchema.js";
import type { SchemaOptions } from "./Schema.js";

/**
 * Options for `CountrySchema`.
 *
 * @see https://dhoulb.github.io/shelving/schema/CountrySchema/CountrySchemaOptions
 */
export interface CountrySchemaOptions extends SchemaOptions {
	/** Country value, or `"detect"` to resolve from browser language. */
	readonly value?: PossibleCountry;
}

/**
 * Schema that defines a valid ISO 3166 country code, e.g. `GB`.
 *
 * - The input is coerced with `getCountry()`, then checked against the known set of `COUNTRIES`.
 * - A `value` of `"detect"` resolves the default country from the browser language.
 *
 * @example
 *  const schema = new CountrySchema({});
 *  schema.validate("GB"); // "GB"
 * @see https://dhoulb.github.io/shelving/schema/CountrySchema/CountrySchema
 */
export class CountrySchema extends ChoiceSchema<Country, PossibleCountry> {
	/**
	 * Create a new `CountrySchema`.
	 *
	 * @example new CountrySchema({ value: "GB" })
	 * @see https://dhoulb.github.io/shelving/schema/CountrySchema/CountrySchema
	 */
	constructor({ one = "country", title = "Country", value = "detect", ...options }: CountrySchemaOptions = {}) {
		super({ one, title, options: COUNTRIES, value, ...options });
	}

	/**
	 * Validate an unknown input value and return a valid country code.
	 *
	 * @param unsafeValue The value to validate (defaults to this schema's `value`).
	 * @returns The validated ISO 3166 country code.
	 * @throws `string` `"Required"` if the value is empty, or `` `Unknown ${one}` `` if it is not a known country.
	 * @example schema.validate("GB") // "GB"
	 * @see https://dhoulb.github.io/shelving/schema/CountrySchema/CountrySchema/validate
	 */
	override validate(unsafeValue: unknown = this.value): Country {
		const country = getCountry(unsafeValue);
		if (country) return super.validate(country);
		throw unsafeValue === "detect" ? "Required" : `Unknown ${this.one}`;
	}
}

/**
 * Sugar instance of `CountrySchema` for a required ISO 3166 country code, e.g. `GB`. Equivalent to `new CountrySchema({})`.
 *
 * @example COUNTRY.validate("GB") // "GB"
 * @see https://dhoulb.github.io/shelving/schema/CountrySchema/COUNTRY
 */
export const COUNTRY = new CountrySchema({});

/**
 * Sugar instance allowing a `COUNTRY` or `null`. Equivalent to `NULLABLE(COUNTRY)`.
 *
 * @example NULLABLE_COUNTRY.validate(null) // null
 * @see https://dhoulb.github.io/shelving/schema/CountrySchema/NULLABLE_COUNTRY
 */
export const NULLABLE_COUNTRY = NULLABLE(COUNTRY);
