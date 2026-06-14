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
 * - The input is coerced with `getCountry`, then checked against the known set of `COUNTRIES`.
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
	 * @param options Options for the schema (`value`, plus base `SchemaOptions`).
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
 * Valid country code, e.g. `GB` (required because falsy values are invalid).
 *
 * @example COUNTRY.validate("GB") // "GB"
 * @see https://dhoulb.github.io/shelving/schema/CountrySchema/COUNTRY
 */
export const COUNTRY = new CountrySchema({});

/**
 * Valid country code, e.g. `GB`, or `null`.
 *
 * @example NULLABLE_COUNTRY.validate(null) // null
 * @see https://dhoulb.github.io/shelving/schema/CountrySchema/NULLABLE_COUNTRY
 */
export const NULLABLE_COUNTRY = NULLABLE(COUNTRY);
