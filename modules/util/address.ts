import { type Country, formatCountry } from "./country.js";

/** Valid shape for postal address data. */
export type AddressData = {
	readonly address1: string;
	readonly address2: string;
	readonly city: string;
	readonly state: string;
	readonly postcode: string;
	readonly country: Country;
};

/** Format address lines into a printable string. */
export function formatAddress({ address1, address2, city, state, postcode, country }: AddressData): string {
	return `${address1}\n${address2 ? `${address2}\n` : ""}${city}\n${state}\n${postcode}\n${formatCountry(country)}`;
}
