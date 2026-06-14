import { type CurrencyCode, getCurrencyStep, getCurrencySymbol, requireCurrencyCode } from "../util/currency.js";
import { formatCurrency } from "../util/format.js";
import type { NullableSchema } from "./NullableSchema.js";
import { NULLABLE } from "./NullableSchema.js";
import { NumberSchema, type NumberSchemaOptions } from "./NumberSchema.js";

/**
 * Options for `CurrencyAmountSchema`.
 *
 * - `currency` — ISO 4217 currency code that determines the step and symbol.
 * - `symbol` — override the currency symbol used when formatting.
 *
 * @see https://dhoulb.github.io/shelving/schema/CurrencyAmountSchema/CurrencyAmountSchemaOptions
 */
export interface CurrencyAmountSchemaOptions extends NumberSchemaOptions {
	readonly symbol?: string | undefined;
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
	/** Rounding step, always defined and inferred from the currency's minor units. */
	declare readonly step: number; // Step is always defined for `CurrencyAmountSchema`, as it's inferred from the currency.
	/** ISO 4217 currency code this schema validates amounts for. */
	readonly currency: CurrencyCode;
	/** Currency symbol used when formatting amounts. */
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

	override format(value: number): string {
		const options = this.step >= 1 ? { maximumFractionDigits: 0 } : {}; // Skip showing decimal places if step is 1 or more.
		return formatCurrency(value, this.currency, options, this.format);
	}
}

/**
 * Valid non-negative monetary amount in the a currency.
 *
 * *Factory for `CurrencyAmountSchema`.*
 */
export function CURRENCY_AMOUNT(currency: CurrencyCode): CurrencyAmountSchema {
	return new CurrencyAmountSchema({ currency });
}
export const USD_AMOUNT = new CurrencyAmountSchema({ currency: "USD" });
export const GBP_AMOUNT = new CurrencyAmountSchema({ currency: "GBP" });
export const EUR_AMOUNT = new CurrencyAmountSchema({ currency: "EUR" });

/**
 * Valid optional monetary amount in the default currency, or `null`.
 *
 * *Factory for `NullableSchema`.*
 */
export function NULLABLE_CURRENCY_AMOUNT(currency: CurrencyCode): NullableSchema<number> {
	return NULLABLE(CURRENCY_AMOUNT(currency));
}
export const NULLABLE_USD_AMOUNT = NULLABLE(USD_AMOUNT);
export const NULLABLE_GBP_AMOUNT = NULLABLE(GBP_AMOUNT);
export const NULLABLE_EUR_AMOUNT = NULLABLE(EUR_AMOUNT);
