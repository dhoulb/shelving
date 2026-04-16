import { type CurrencyCode, getCurrencyStep, getCurrencySymbol, requireCurrencyCode } from "../util/currency.js";
import { formatCurrency } from "../util/format.js";
import { NULLABLE } from "./NullableSchema.js";
import { NumberSchema, type NumberSchemaOptions } from "./NumberSchema.js";

/** Allowed options for `CurrencyAmountSchema`. */
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
 */
export class CurrencyAmountSchema extends NumberSchema {
	readonly currency: CurrencyCode;
	readonly symbol: string;

	constructor({
		currency,
		one = "amount",
		title = "Amount",
		symbol,
		step,
		format = (value, options) => formatCurrency(value, currency, options),
		...options
	}: CurrencyAmountSchemaOptions) {
		const validCurrency = requireCurrencyCode(currency, CurrencyAmountSchema);
		super({
			one,
			title,
			step: step ?? getCurrencyStep(validCurrency, CurrencyAmountSchema),
			format,
			...options,
		});
		this.currency = validCurrency;
		this.symbol = symbol ?? getCurrencySymbol(validCurrency, CurrencyAmountSchema);
	}
}

/** Valid non-negative monetary amount in the a currency. */
export const CURRENCY = (currency: CurrencyCode) => new CurrencyAmountSchema({ title: "Amount", currency, min: 0, value: 0 });

/** Valid optional monetary amount in the default currency, or `null`. */
export const NULLABLE_CURRENCY = (currency: CurrencyCode) => NULLABLE(CURRENCY(currency));
