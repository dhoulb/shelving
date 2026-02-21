import { COUNTRIES, type Country, getCountry } from "../util/country.js";
import { isProp } from "../util/object.js";
import { ChoiceSchema, type ChoiceSchemaOptions } from "./ChoiceSchema.js";
import { NULLABLE } from "./NullableSchema.js";

/** Allowed options for `CountrySchema` */
export interface CountrySchemaOptions extends Omit<ChoiceSchemaOptions<Country>, "options" | "value"> {
	/** Country value, or `"detect"` to resolve from browser language. */
	readonly value?: Country | "detect";
}

/** Schema that validates an ISO country code. */
export class CountrySchema extends ChoiceSchema<Country> {
	readonly defaultValue: Country | "detect";
	constructor({ one = "country", title = "Country", value = "detect", ...options }: CountrySchemaOptions = {}) {
		super({ one, title, options: COUNTRIES, value: value === "detect" ? "GB" : value, ...options });
		this.defaultValue = value;
	}
	override validate(unsafeValue: unknown = this.defaultValue): Country {
		const country = getCountry(unsafeValue);
		if (country) return super.validate(country);
		if (unsafeValue === undefined || unsafeValue === null || unsafeValue === "" || unsafeValue === "detect") throw "Required";
		if (typeof unsafeValue === "string" && isProp(COUNTRIES, unsafeValue.toUpperCase())) return super.validate(unsafeValue.toUpperCase());
		return super.validate(unsafeValue);
	}
}

/** Valid country code, e.g. `GB` (required because falsy values are invalid). */
export const COUNTRY = new CountrySchema({});

/** Valid country code, e.g. `GB`, or `null` */
export const NULLABLE_COUNTRY = NULLABLE(COUNTRY);
