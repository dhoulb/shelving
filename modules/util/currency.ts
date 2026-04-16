import { RequiredError } from "../error/RequiredError.js";
import type { ImmutableArray } from "./array.js";
import type { AnyCaller } from "./function.js";

/** ISO 4217 currency code, e.g. `GBP` or `USD`. */
export type CurrencyCode = string;

/** Array of all supported currency codes in this runtime. */
export const CURRENCY_CODES: ImmutableArray<CurrencyCode> = Intl.supportedValuesOf("currency");

/**
 * Require that a value is a valid ISO 4217 currency code, and return it as a `Currency` type.
 */
export function getCurrencyCode(value: string): CurrencyCode | undefined {
	const currency = value.toUpperCase().trim();
	return CURRENCY_CODES.includes(currency) ? currency : undefined;
}

/**
 * Require that a value is a valid ISO 4217 currency code, and return it as a `Currency` type.
 */
export function requireCurrencyCode(value: string, caller: AnyCaller = requireCurrencyCode): CurrencyCode {
	const currency = getCurrencyCode(value);
	if (!currency) throw new RequiredError("Unknown currency code", { received: value, caller });
	return currency;
}

function _formatter(currency: string, caller: AnyCaller): Intl.NumberFormat {
	return new Intl.NumberFormat(undefined, {
		style: "currency",
		currency: requireCurrencyCode(currency, caller),
		currencyDisplay: "narrowSymbol",
	});
}

const _isCurrencyNumberPart = ({ type }: Intl.NumberFormatPart) => type === "currency";

/**
 * Get the display symbol used for a currency.
 *
 * @throws {RequiredError} If the currency code is malformed or unsupported.
 *
 * @example getCurrencySymbol("GBP"); // "£"
 */
export function getCurrencySymbol(currency: CurrencyCode, caller: AnyCaller = getCurrencySymbol): string {
	return _formatter(currency, caller).formatToParts(0).find(_isCurrencyNumberPart)?.value as string;
}

/**
 * Get the "step" value for a currency, i.e. the smallest fractional unit that is used for that currency.
 * - E.g. `0.01` for USD, `0.001` for some cryptocurrencies, and `1` for JPY.
 * @throws {RequiredError} If the currency code is malformed or unsupported.
 */
export function getCurrencyStep(currency: CurrencyCode, caller: AnyCaller = getCurrencyStep): number {
	const { minimumFractionDigits = 0 } = _formatter(currency, caller).resolvedOptions();
	return 1 / 10 ** minimumFractionDigits;
}
