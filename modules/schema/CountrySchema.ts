import { COUNTRIES, type Country, getCountry, type PossibleCountry } from "../util/geo.js";
import { ChoiceSchema } from "./ChoiceSchema.js";
import { NULLABLE } from "./NullableSchema.js";
import type { SchemaOptions } from "./Schema.js";

/** Allowed options for `CountrySchema` */
export interface CountrySchemaOptions extends SchemaOptions {
	/** Country value, or `"detect"` to resolve from browser language. */
	readonly value?: PossibleCountry;
}

/** Schema that validates an ISO country code. */
export class CountrySchema extends ChoiceSchema<Country, PossibleCountry> {
	constructor({ one = "country", title = "Country", value = "detect", ...options }: CountrySchemaOptions = {}) {
		super({ one, title, options: COUNTRIES, value, ...options });
	}
	override validate(unsafeValue: unknown = this.value): Country {
		const country = getCountry(unsafeValue);
		if (country) return super.validate(country);
		throw unsafeValue === "detect" ? "Required" : `Unknown ${this.one}`;
	}
}

/** Valid country code, e.g. `GB` (required because falsy values are invalid). */
export const COUNTRY = new CountrySchema({});

/** Valid country code, e.g. `GB`, or `null` */
export const NULLABLE_COUNTRY = NULLABLE(COUNTRY);
