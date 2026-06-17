import type { ImmutableArray } from "../util/array.js";
import { CURRENCY_CODES, type CurrencyCode } from "../util/currency.js";
import { NULLABLE } from "./NullableSchema.js";
import type { SchemaOptions } from "./Schema.js";
import { type StringInputType, StringSchema } from "./StringSchema.js";

/**
 * Options for `CurrencyCodeSchema`.
 *
 * - The length, format, and single-line constraints are fixed internally, so only the presentation-level string options plus `currencies` are exposed.
 *
 * @see https://dhoulb.github.io/shelving/schema/CurrencyCodeSchema/CurrencyCodeSchemaOptions
 */
export interface CurrencyCodeSchemaOptions extends SchemaOptions {
	/** Default string value used when the input is `undefined`. */
	readonly value?: string | undefined;
	/**
	 * Maximum allowed character length.
	 * @default 3
	 */
	readonly max?: number | undefined;
	/** Force the result to `"upper"` or `"lower"` case. */
	readonly case?: "upper" | "lower" | undefined;
	/** HTML `<input />` `type=""` hint for downstream UIs. */
	readonly input?: StringInputType | undefined;
	/**
	 * Set of allowed ISO 4217 currency codes.
	 * @default CURRENCY_CODES
	 */
	readonly currencies?: ImmutableArray<CurrencyCode> | undefined;
}

/**
 * Schema that defines a valid ISO 4217 currency code, e.g. `GBP`.
 *
 * - The input is sanitized to three uppercase letters, then checked against the allowed `currencies`.
 *
 * @example
 *  const schema = new CurrencyCodeSchema({});
 *  schema.validate("gbp"); // "GBP"
 * @see https://dhoulb.github.io/shelving/schema/CurrencyCodeSchema/CurrencyCodeSchema
 */
export class CurrencyCodeSchema extends StringSchema {
	/**
	 * Set of allowed ISO 4217 currency codes.
	 *
	 * @see https://dhoulb.github.io/shelving/schema/CurrencyCodeSchema/CurrencyCodeSchema/currencies
	 */
	readonly currencies: ImmutableArray<CurrencyCode>;

	/**
	 * Create a new `CurrencyCodeSchema`.
	 *
	 * @example new CurrencyCodeSchema({ currencies: ["GBP", "USD"] })
	 * @see https://dhoulb.github.io/shelving/schema/CurrencyCodeSchema/CurrencyCodeSchema
	 */
	constructor({ one = "currency", title = "Currency", currencies = CURRENCY_CODES, max = 3, ...options }: CurrencyCodeSchemaOptions) {
		super({
			one,
			title,
			...options,
			max, // Valid currency code is 3 uppercase letters.
			min: 3,
			rows: 1,
			case: "upper",
			match: /^[A-Z]{3}$/, // Valid currency code is 3 uppercase letters.
		});
		this.currencies = currencies;
	}

	/**
	 * Sanitize an input string down to uppercase `A-Z` letters.
	 *
	 * @param insaneString The raw input string to sanitize.
	 * @returns The sanitized string with all non-`A-Z` characters stripped.
	 * @example schema.sanitize(" gb p ") // "GBP"
	 * @see https://dhoulb.github.io/shelving/schema/CurrencyCodeSchema/CurrencyCodeSchema/sanitize
	 */
	override sanitize(insaneString: string): string {
		// Strip characters that aren't A-Z (including whitespace).
		return super.sanitize(insaneString).replace(/[^A-Z+]/g, "");
	}

	/**
	 * Validate an unknown input value and return a valid currency code.
	 *
	 * @param value The value to validate (defaults to this schema's `value`).
	 * @returns The validated three-letter uppercase currency code.
	 * @throws `string` if the value is not a valid string, or `"Unknown currency code"` if it is not in `currencies`.
	 * @example schema.validate("gbp") // "GBP"
	 * @see https://dhoulb.github.io/shelving/schema/CurrencyCodeSchema/CurrencyCodeSchema/validate
	 */
	override validate(value?: unknown): string {
		const currency = super.validate(value);
		if (!this.currencies.includes(currency)) throw "Unknown currency code";
		return currency;
	}
}

/**
 * Sugar instance of [`CurrencyCodeSchema`](/schema/CurrencyCodeSchema) for a required ISO 4217 currency code, e.g. `GBP`. Equivalent to `new CurrencyCodeSchema({})`.
 *
 * @example CURRENCY_CODE.validate("gbp") // "GBP"
 * @see https://dhoulb.github.io/shelving/schema/CurrencyCodeSchema/CURRENCY_CODE
 */
export const CURRENCY_CODE = new CurrencyCodeSchema({});

/**
 * Sugar instance allowing a [`CURRENCY_CODE`](/schema/CURRENCY_CODE) or `null`. Equivalent to `NULLABLE(CURRENCY_CODE)`.
 *
 * @example NULLABLE_CURRENCY_CODE.validate(null) // null
 * @see https://dhoulb.github.io/shelving/schema/CurrencyCodeSchema/NULLABLE_CURRENCY_CODE
 */
export const NULLABLE_CURRENCY_CODE = NULLABLE(CURRENCY_CODE);
