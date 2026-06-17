import { type CurrencyCode, getCurrencyStep, getCurrencySymbol, requireCurrencyCode } from "../util/currency.js";
import { formatCurrency } from "../util/format.js";
import type { NullableSchema } from "./NullableSchema.js";
import { NULLABLE } from "./NullableSchema.js";
import { NumberSchema, type NumberSchemaOptions } from "./NumberSchema.js";

/**
 * Options for a [`CurrencyAmountSchema`](/schema/CurrencyAmountSchema).
 *
 * Inherits [`NumberSchemaOptions`](/schema/NumberSchema/NumberSchemaOptions), but `step` defaults to the currency's minor units rather than being unset.
 *
 * @see https://dhoulb.github.io/shelving/schema/CurrencyAmountSchema/CurrencyAmountSchemaOptions
 */
export interface CurrencyAmountSchemaOptions extends NumberSchemaOptions {
	/**
	 * Override the currency symbol used when formatting.
	 * @default The symbol inferred from `currency`.
	 */
	readonly symbol?: string | undefined;
	/** ISO 4217 currency code that determines the step and symbol. */
	readonly currency: CurrencyCode;
}

/**
 * Schema representing a numeric amount in a specific currency.
 *
 * - The validation step is inferred from the currency's minor units.
 * - The default formatter renders amounts using shelving's currency helpers.
 *
 * @example
 * const PRICE = new CurrencyAmountSchema({ currency: "GBP", min: 0 });
 * PRICE.validate("12.345"); // 12.35
 * PRICE.format(12.3); // "£12.30"
 * @see https://dhoulb.github.io/shelving/schema/CurrencyAmountSchema/CurrencyAmountSchema
 */
export class CurrencyAmountSchema extends NumberSchema {
	/**
	 * Rounding step, always defined and inferred from the currency's minor units.
	 *
	 * @see https://dhoulb.github.io/shelving/schema/CurrencyAmountSchema/CurrencyAmountSchema/step
	 */
	declare readonly step: number; // Step is always defined for `CurrencyAmountSchema`, as it's inferred from the currency.
	/**
	 * ISO 4217 currency code this schema validates amounts for.
	 *
	 * @see https://dhoulb.github.io/shelving/schema/CurrencyAmountSchema/CurrencyAmountSchema/currency
	 */
	readonly currency: CurrencyCode;
	/**
	 * Currency symbol used when formatting amounts.
	 *
	 * @see https://dhoulb.github.io/shelving/schema/CurrencyAmountSchema/CurrencyAmountSchema/symbol
	 */
	readonly symbol: string;

	/**
	 * Create a new `CurrencyAmountSchema`.
	 *
	 * @param options Options for the schema (`currency` required, optional `symbol`, `step`, plus base `NumberSchemaOptions`).
	 * @throws `string` if `currency` is not a valid ISO 4217 currency code.
	 */
	constructor({ currency, one = "amount", title = "Amount", symbol, step, ...options }: CurrencyAmountSchemaOptions) {
		const validCurrency = requireCurrencyCode(currency, CurrencyAmountSchema);
		super({
			one,
			title,
			step: step ?? getCurrencyStep(validCurrency, CurrencyAmountSchema),
			...options,
		});
		this.currency = validCurrency;
		this.symbol = symbol ?? getCurrencySymbol(validCurrency, CurrencyAmountSchema);
	}

	/**
	 * Format a validated amount as a currency string for display.
	 *
	 * - Decimal places are omitted when `step` is `1` or more.
	 *
	 * @param value The validated amount to format.
	 * @returns The amount formatted using the schema's currency and symbol.
	 * @example schema.format(12.3) // "£12.30"
	 * @see https://dhoulb.github.io/shelving/schema/CurrencyAmountSchema/CurrencyAmountSchema/format
	 */
	override format(value: number): string {
		const options = this.step >= 1 ? { maximumFractionDigits: 0 } : {}; // Skip showing decimal places if step is 1 or more.
		return formatCurrency(value, this.currency, options, this.format);
	}
}

/**
 * Create a `CurrencyAmountSchema` for a non-negative monetary amount in a currency.
 *
 * Sugar factory for [`CurrencyAmountSchema`](/schema/CurrencyAmountSchema).
 *
 * @param currency ISO 4217 currency code that determines the step and symbol.
 * @returns A `CurrencyAmountSchema` validating amounts in `currency`.
 * @throws `string` if `currency` is not a valid ISO 4217 currency code.
 * @example CURRENCY_AMOUNT("GBP").validate("12.345") // 12.35
 * @see https://dhoulb.github.io/shelving/schema/CurrencyAmountSchema/CURRENCY_AMOUNT
 */
export function CURRENCY_AMOUNT(currency: CurrencyCode): CurrencyAmountSchema {
	return new CurrencyAmountSchema({ currency });
}

/**
 * Sugar instance of [`CurrencyAmountSchema`](/schema/CurrencyAmountSchema) for a US dollar amount. Equivalent to `new CurrencyAmountSchema({ currency: "USD" })`.
 *
 * @example USD_AMOUNT.validate("12.345") // 12.35
 * @see https://dhoulb.github.io/shelving/schema/CurrencyAmountSchema/USD_AMOUNT
 */
export const USD_AMOUNT = new CurrencyAmountSchema({ currency: "USD" });

/**
 * Sugar instance of [`CurrencyAmountSchema`](/schema/CurrencyAmountSchema) for a pound sterling amount. Equivalent to `new CurrencyAmountSchema({ currency: "GBP" })`.
 *
 * @example GBP_AMOUNT.validate("12.345") // 12.35
 * @see https://dhoulb.github.io/shelving/schema/CurrencyAmountSchema/GBP_AMOUNT
 */
export const GBP_AMOUNT = new CurrencyAmountSchema({ currency: "GBP" });

/**
 * Sugar instance of [`CurrencyAmountSchema`](/schema/CurrencyAmountSchema) for a euro amount. Equivalent to `new CurrencyAmountSchema({ currency: "EUR" })`.
 *
 * @example EUR_AMOUNT.validate("12.345") // 12.35
 * @see https://dhoulb.github.io/shelving/schema/CurrencyAmountSchema/EUR_AMOUNT
 */
export const EUR_AMOUNT = new CurrencyAmountSchema({ currency: "EUR" });

/**
 * Create a `NullableSchema` for an optional monetary amount in a currency, or `null`.
 *
 * Sugar factory for [`NullableSchema`](/schema/NullableSchema).
 *
 * @param currency ISO 4217 currency code that determines the step and symbol.
 * @returns A `NullableSchema` validating amounts in `currency`, or `null`.
 * @throws `string` if `currency` is not a valid ISO 4217 currency code.
 * @example NULLABLE_CURRENCY_AMOUNT("GBP").validate(null) // null
 * @see https://dhoulb.github.io/shelving/schema/CurrencyAmountSchema/NULLABLE_CURRENCY_AMOUNT
 */
export function NULLABLE_CURRENCY_AMOUNT(currency: CurrencyCode): NullableSchema<number> {
	return NULLABLE(CURRENCY_AMOUNT(currency));
}

/**
 * Sugar instance allowing a [`USD_AMOUNT`](/schema/USD_AMOUNT) or `null`. Equivalent to `NULLABLE(USD_AMOUNT)`.
 *
 * @example NULLABLE_USD_AMOUNT.validate(null) // null
 * @see https://dhoulb.github.io/shelving/schema/CurrencyAmountSchema/NULLABLE_USD_AMOUNT
 */
export const NULLABLE_USD_AMOUNT = NULLABLE(USD_AMOUNT);

/**
 * Sugar instance allowing a [`GBP_AMOUNT`](/schema/GBP_AMOUNT) or `null`. Equivalent to `NULLABLE(GBP_AMOUNT)`.
 *
 * @example NULLABLE_GBP_AMOUNT.validate(null) // null
 * @see https://dhoulb.github.io/shelving/schema/CurrencyAmountSchema/NULLABLE_GBP_AMOUNT
 */
export const NULLABLE_GBP_AMOUNT = NULLABLE(GBP_AMOUNT);

/**
 * Sugar instance allowing an [`EUR_AMOUNT`](/schema/EUR_AMOUNT) or `null`. Equivalent to `NULLABLE(EUR_AMOUNT)`.
 *
 * @example NULLABLE_EUR_AMOUNT.validate(null) // null
 * @see https://dhoulb.github.io/shelving/schema/CurrencyAmountSchema/NULLABLE_EUR_AMOUNT
 */
export const NULLABLE_EUR_AMOUNT = NULLABLE(EUR_AMOUNT);
