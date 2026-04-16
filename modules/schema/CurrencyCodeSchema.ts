import type { ImmutableArray } from "../util/array.js";
import { CURRENCY_CODES, type CurrencyCode } from "../util/currency.js";
import { NULLABLE } from "./NullableSchema.js";
import type { StringSchemaOptions } from "./StringSchema.js";
import { StringSchema } from "./StringSchema.js";

/** Options for a `CurrencyCodeSchema` */
export interface CurrencyCodeSchemaOptions extends Omit<StringSchemaOptions, "input" | "min" | "max" | "match" | "multiline"> {
	currencies?: ImmutableArray<CurrencyCode>;
}

/**
 * Type of `StringSchema` that defines a valid currency code.
 */
export class CurrencyCodeSchema extends StringSchema {
	readonly currencies: ImmutableArray<CurrencyCode>;
	constructor({ one = "currency", title = "Currency", currencies = CURRENCY_CODES, ...options }: CurrencyCodeSchemaOptions) {
		super({
			one,
			title,
			...options,
			min: 3,
			max: 3, // Valid currency code is 3 uppercase letters.
			case: "upper",
			match: /^[A-Z]{3}$/, // Valid currency code is 3 uppercase letters.
		});
		this.currencies = currencies;
	}
	override sanitize(insaneString: string): string {
		// Strip characters that aren't A-Z (including whitespace).
		return super.sanitize(insaneString).replace(/[^A-Z+]/g, "");
	}
	override validate(value?: unknown): string {
		const currency = super.validate(value);
		if (!this.currencies.includes(currency)) throw "Unknown currency code";
		return currency;
	}
}

/** Valid currency code, e.g. `GBP` */
export const CURRENCY_CODE = new CurrencyCodeSchema({});

/** Valid currency code, e.g. `GBP`, or `null` */
export const NULLABLE_CURRENCY_CODE = NULLABLE(CURRENCY_CODE);
