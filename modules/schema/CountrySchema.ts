import { COUNTRIES, type Country, getCountry, type PossibleCountry } from "../util/geo.js";
import { ChoiceSchema } from "./ChoiceSchema.js";
import { NULLABLE } from "./NullableSchema.js";
import type { SchemaOptions } from "./Schema.js";

/**
 * Options for `CountrySchema`.
 *
 * @see https://shelving.cc/schema/CountrySchemaOptions
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
 * @see https://shelving.cc/schema/CountrySchema
 */
export class CountrySchema extends ChoiceSchema<Country, PossibleCountry> {
	constructor({ one = "country", title = "Country", value = "detect", ...options }: CountrySchemaOptions = {}) {
		super({ one, title, options: COUNTRIES, value, ...options });
	}
	override get(unsafeValue: unknown = this.value): Country | undefined {
		return getCountry(unsafeValue);
	}
}

/**
 * Sugar instance of `CountrySchema` for a required ISO 3166 country code, e.g. `GB`. Equivalent to `new CountrySchema({})`.
 *
 * @example COUNTRY.validate("GB") // "GB"
 * @see https://shelving.cc/schema/COUNTRY
 */
export const COUNTRY = new CountrySchema({});

/**
 * Sugar instance allowing a `COUNTRY` or `null`. Equivalent to `NULLABLE(COUNTRY)`.
 *
 * @example NULLABLE_COUNTRY.validate(null) // null
 * @see https://shelving.cc/schema/NULLABLE_COUNTRY
 */
export const NULLABLE_COUNTRY = NULLABLE(COUNTRY);
