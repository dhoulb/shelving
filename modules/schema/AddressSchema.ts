import { type AddressData, formatAddress } from "../util/geo.js";
import { COUNTRY } from "./CountrySchema.js";
import { DataSchema, type DataSchemaOptions } from "./DataSchema.js";
import { NULLABLE } from "./NullableSchema.js";
import type { Schemas } from "./Schema.js";
import { StringSchema } from "./StringSchema.js";

export type { AddressData };
export { formatAddress };

const ADDRESS_PROPS: Schemas<AddressData> = {
	address1: new StringSchema({ title: "Address", max: 60, min: 1 }),
	address2: new StringSchema({ title: undefined, max: 60, min: 0 }),
	city: new StringSchema({ title: "City", min: 1, max: 60 }),
	state: new StringSchema({ title: "State", min: 0, max: 60 }),
	postcode: new StringSchema({ title: "Postcode", min: 1, max: 12, case: "upper" }),
	country: COUNTRY,
};

/**
 * Allowed options for `AddressSchema`.
 *
 * @see https://dhoulb.github.io/shelving/schema/AddressSchema/AddressSchemaOptions
 */
export interface AddressSchemaOptions extends Omit<DataSchemaOptions<AddressData>, "props"> {}

/**
 * Schema that validates a postal address.
 *
 * - Validates the `address1`, `address2`, `city`, `state`, `postcode`, and `country` fields as a single `AddressData` object.
 * - Formats validated values into a human-readable address string via `formatAddress()`.
 *
 * @example ADDRESS.validate({ address1: "1 High St", city: "London", postcode: "SW1A 1AA", country: "GB" });
 * @see https://dhoulb.github.io/shelving/schema/AddressSchema/AddressSchema
 */
export class AddressSchema extends DataSchema<AddressData> {
	/**
	 * Create a new `AddressSchema`.
	 *
	 * @param options Options for the schema (inherits `DataSchema` options except `props`, which is fixed to the postal-address fields).
	 * @param options.one Singular noun describing one value, used in error messages (defaults to `"address"`).
	 * @param options.title Title of the schema, e.g. for a corresponding field (defaults to `"Address"`).
	 */
	constructor({ one = "address", title = "Address", ...options }: AddressSchemaOptions = {}) {
		super({ one, title, props: ADDRESS_PROPS, ...options });
	}

	/**
	 * Format a validated address into a human-readable string.
	 *
	 * @param value The valid address data to format.
	 * @returns The address formatted as a single display string.
	 * @example ADDRESS.format({ address1: "1 High St", city: "London", postcode: "SW1A 1AA", country: "GB" });
	 * @see https://dhoulb.github.io/shelving/schema/AddressSchema/AddressSchema/format
	 */
	override format(value: AddressData) {
		return formatAddress(value);
	}
}

/**
 * Valid postal address data.
 *
 * @example ADDRESS.validate({ address1: "1 High St", city: "London", postcode: "SW1A 1AA", country: "GB" });
 * @see https://dhoulb.github.io/shelving/schema/AddressSchema/ADDRESS
 */
export const ADDRESS = new AddressSchema({});

/**
 * Valid postal address data, or `null`
 *
 * @example NULLABLE_ADDRESS.validate(null); // Returns null
 * @see https://dhoulb.github.io/shelving/schema/AddressSchema/NULLABLE_ADDRESS
 */
export const NULLABLE_ADDRESS = NULLABLE(ADDRESS);
