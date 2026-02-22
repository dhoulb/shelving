import type { AddressData } from "../util/geo.js";
import { COUNTRY } from "./CountrySchema.js";
import { DataSchema, type DataSchemaOptions } from "./DataSchema.js";
import { NULLABLE } from "./NullableSchema.js";
import type { Schemas } from "./Schema.js";
import { StringSchema } from "./StringSchema.js";

const ADDRESS_PROPS: Schemas<AddressData> = {
	address1: new StringSchema({ title: "Address 1", max: 60, min: 1 }),
	address2: new StringSchema({ title: "Address 2", max: 60, min: 0 }),
	city: new StringSchema({ title: "City", min: 1, max: 60 }),
	state: new StringSchema({ title: "State", min: 1, max: 60 }),
	postcode: new StringSchema({ title: "Postcode", min: 1, max: 12, case: "upper" }),
	country: COUNTRY,
};

/** Allowed options for `AddressSchema` */
export interface AddressSchemaOptions extends Omit<DataSchemaOptions<AddressData>, "props"> {}

/** Schema that validates a postal address. */
export class AddressSchema extends DataSchema<AddressData> {
	constructor({ one = "address", title = "Address", ...options }: AddressSchemaOptions = {}) {
		super({ one, title, props: ADDRESS_PROPS, ...options });
	}
}

/** Valid postal address data. */
export const ADDRESS = new AddressSchema({});

/** Valid postal address data, or `null` */
export const NULLABLE_ADDRESS = NULLABLE(ADDRESS);
