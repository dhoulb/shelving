import { type CurrencyCode, getCurrencyStep, getCurrencySymbol, requireCurrencyCode } from "../util/currency.js";
import { formatCurrency } from "../util/format.js";
import type { NullableSchema } from "./NullableSchema.js";
import { NULLABLE } from "./NullableSchema.js";
import { NumberSchema, type NumberSchemaOptions } from "./NumberSchema.js";

/**
 * Options for `CurrencyAmountSchema`.
 *
 * @see https://shelving.cc/schema/CurrencyAmountSchemaOptions
 */
export interface CurrencyAmountSchemaOptions extends NumberSchemaOptions {
	/** Override the currency symbol used when formatting. */
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
 * @see https://shelving.cc/schema/CurrencyAmountSchema
 */
export class CurrencyAmountSchema extends NumberSchema {
	/**
	 * Rounding step, always defined and inferred from the currency's minor units.
	 *
	 * @see https://shelving.cc/schema/CurrencyAmountSchema/step
	 */
	declare readonly step: number; // Step is always defined for `CurrencyAmountSchema`, as it's inferred from the currency.
	/**
	 * ISO 4217 currency code this schema validates amounts for.
	 *
	 * @see https://shelving.cc/schema/CurrencyAmountSchema/currency
	 */
	readonly currency: CurrencyCode;
	/**
	 * Currency symbol used when formatting amounts.
	 *
	 * @see https://shelving.cc/schema/CurrencyAmountSchema/symbol
	 */
	readonly symbol: string;

	/** @throws `string` if `currency` is not a valid ISO 4217 currency code. */
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

	/** Formats the amount with its currency symbol; omits decimals when `step` is `1` or more. */
	override format(value: number): string {
		const options = this.step >= 1 ? { maximumFractionDigits: 0 } : {}; // Skip showing decimal places if step is 1 or more.
		return formatCurrency(value, this.currency, options, this.format);
	}
}

/**
 * Create a `CurrencyAmountSchema` for a non-negative monetary amount in a currency.
 *
 * Sugar factory for `CurrencyAmountSchema`.
 *
 * @param currency ISO 4217 currency code that determines the step and symbol.
 * @throws `string` if `currency` is not a valid ISO 4217 currency code.
 * @example CURRENCY_AMOUNT("GBP").validate("12.345") // 12.35
 * @see https://shelving.cc/schema/CURRENCY_AMOUNT
 */
export function CURRENCY_AMOUNT(currency: CurrencyCode): CurrencyAmountSchema {
	return new CurrencyAmountSchema({ currency });
}

/**
 * Sugar instance of `CurrencyAmountSchema` for a US dollar amount. Equivalent to `new CurrencyAmountSchema({ currency: "USD" })`.
 *
 * @example USD_AMOUNT.validate("12.345") // 12.35
 * @see https://shelving.cc/schema/USD_AMOUNT
 */
export const USD_AMOUNT = new CurrencyAmountSchema({ currency: "USD" });

/**
 * Sugar instance of `CurrencyAmountSchema` for a pound sterling amount. Equivalent to `new CurrencyAmountSchema({ currency: "GBP" })`.
 *
 * @example GBP_AMOUNT.validate("12.345") // 12.35
 * @see https://shelving.cc/schema/GBP_AMOUNT
 */
export const GBP_AMOUNT = new CurrencyAmountSchema({ currency: "GBP" });

/**
 * Sugar instance of `CurrencyAmountSchema` for a euro amount. Equivalent to `new CurrencyAmountSchema({ currency: "EUR" })`.
 *
 * @example EUR_AMOUNT.validate("12.345") // 12.35
 * @see https://shelving.cc/schema/EUR_AMOUNT
 */
export const EUR_AMOUNT = new CurrencyAmountSchema({ currency: "EUR" });

/**
 * Create a `NullableSchema` for an optional monetary amount in a currency, or `null`.
 *
 * Sugar factory for `NullableSchema`.
 *
 * @param currency ISO 4217 currency code that determines the step and symbol.
 * @throws `string` if `currency` is not a valid ISO 4217 currency code.
 * @example NULLABLE_CURRENCY_AMOUNT("GBP").validate(null) // null
 * @see https://shelving.cc/schema/NULLABLE_CURRENCY_AMOUNT
 */
export function NULLABLE_CURRENCY_AMOUNT(currency: CurrencyCode): NullableSchema<number> {
	return NULLABLE(CURRENCY_AMOUNT(currency));
}

/**
 * Sugar instance allowing a `USD_AMOUNT` or `null`. Equivalent to `NULLABLE(USD_AMOUNT)`.
 *
 * @example NULLABLE_USD_AMOUNT.validate(null) // null
 * @see https://shelving.cc/schema/NULLABLE_USD_AMOUNT
 */
export const NULLABLE_USD_AMOUNT = NULLABLE(USD_AMOUNT);

/**
 * Sugar instance allowing a `GBP_AMOUNT` or `null`. Equivalent to `NULLABLE(GBP_AMOUNT)`.
 *
 * @example NULLABLE_GBP_AMOUNT.validate(null) // null
 * @see https://shelving.cc/schema/NULLABLE_GBP_AMOUNT
 */
export const NULLABLE_GBP_AMOUNT = NULLABLE(GBP_AMOUNT);

/**
 * Sugar instance allowing an `EUR_AMOUNT` or `null`. Equivalent to `NULLABLE(EUR_AMOUNT)`.
 *
 * @example NULLABLE_EUR_AMOUNT.validate(null) // null
 * @see https://shelving.cc/schema/NULLABLE_EUR_AMOUNT
 */
export const NULLABLE_EUR_AMOUNT = NULLABLE(EUR_AMOUNT);
