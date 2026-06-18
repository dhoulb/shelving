import { RequiredError } from "../error/RequiredError.js";
import type { ImmutableArray } from "./array.js";
import type { AnyCaller } from "./function.js";

/**
 * ISO 4217 currency code, e.g. `GBP` or `USD`.
 *
 * @see https://dhoulb.github.io/shelving/util/currency/CurrencyCode
 */
export type CurrencyCode = string;

/**
 * Array of all ISO 4217 currency codes supported by the current runtime's `Intl` implementation.
 *
 * @see https://dhoulb.github.io/shelving/util/currency/CURRENCY_CODES
 */
export const CURRENCY_CODES: ImmutableArray<CurrencyCode> = Intl.supportedValuesOf("currency");

/**
 * Normalise a value to a valid ISO 4217 [`CurrencyCode`](/util/currency/CurrencyCode), or `undefined` if it isn't a supported currency.
 * - Upper-cases and trims the input before checking it against [`CURRENCY_CODES`](/util/currency/CURRENCY_CODES).
 *
 * @param value The string to normalise and check.
 * @returns The normalised `CurrencyCode`, or `undefined` if the value isn't a supported currency.
 * @example getCurrencyCode("gbp") // "GBP"
 * @example getCurrencyCode("nope") // undefined
 * @see https://dhoulb.github.io/shelving/util/currency/getCurrencyCode
 */
export function getCurrencyCode(value: string): CurrencyCode | undefined {
	const currency = value.toUpperCase().trim();
	return CURRENCY_CODES.includes(currency) ? currency : undefined;
}

/**
 * Normalise a value to a valid ISO 4217 [`CurrencyCode`](/util/currency/CurrencyCode), or throw [`RequiredError`](/error/RequiredError) if it isn't a supported currency.
 *
 * @param value The string to normalise and check.
 * @param caller The function to attribute a thrown error to (defaults to `requireCurrencyCode`).
 * @returns The normalised `CurrencyCode`.
 * @throws {RequiredError} If the value isn't a supported ISO 4217 currency code.
 * @example requireCurrencyCode("gbp") // "GBP"
 * @see https://dhoulb.github.io/shelving/util/currency/requireCurrencyCode
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
 * @param currency The ISO 4217 currency code to get the symbol for.
 * @param caller The function to attribute a thrown error to (defaults to `getCurrencySymbol`).
 * @returns The narrow display symbol for the currency, e.g. `"£"` for `"GBP"`.
 * @throws {RequiredError} If the currency code is malformed or unsupported.
 *
 * @example getCurrencySymbol("GBP"); // "£"
 * @see https://dhoulb.github.io/shelving/util/currency/getCurrencySymbol
 */
export function getCurrencySymbol(currency: CurrencyCode, caller: AnyCaller = getCurrencySymbol): string {
	return _formatter(currency, caller).formatToParts(0).find(_isCurrencyNumberPart)?.value as string;
}

/**
 * Get the "step" value for a currency, i.e. the smallest fractional unit that is used for that currency.
 * - E.g. `0.01` for USD, `0.001` for some cryptocurrencies, and `1` for JPY.
 *
 * @param currency The ISO 4217 currency code to get the step for.
 * @param caller The function to attribute a thrown error to (defaults to `getCurrencyStep`).
 * @returns The smallest fractional unit used for the currency.
 * @throws {RequiredError} If the currency code is malformed or unsupported.
 *
 * @example getCurrencyStep("USD") // 0.01
 * @example getCurrencyStep("JPY") // 1
 * @see https://dhoulb.github.io/shelving/util/currency/getCurrencyStep
 */
export function getCurrencyStep(currency: CurrencyCode, caller: AnyCaller = getCurrencyStep): number {
	const { minimumFractionDigits = 0 } = _formatter(currency, caller).resolvedOptions();
	return 1 / 10 ** minimumFractionDigits;
}
