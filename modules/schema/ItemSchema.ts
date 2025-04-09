import type { Data, Database } from "../util/data.js";
import type { Item } from "../util/item.js";
import type { Validators } from "../util/validate.js";
import { DataSchema } from "./DataSchema.js";
import { KEY } from "./KeySchema.js";
import type { KeySchema } from "./KeySchema.js";
import { OPTIONAL, type OptionalSchema } from "./OptionalSchema.js";
import type { SchemaOptions } from "./Schema.js";

/** Allowed options for `ItemSchema` */
export interface ItemSchemaOptions<T extends Data> extends SchemaOptions {
	readonly id?: KeySchema | undefined;
	readonly props: Validators<T>;
	readonly value?: Partial<Item<T>> | undefined;
}

/** Validate an item object. */
export class ItemSchema<T extends Data> extends DataSchema<Item<T>> {
	constructor({ id = KEY, props, ...options }: ItemSchemaOptions<T>) {
		super({ props: { id, ...props } as Validators<Item<T>>, ...options });
	}
}

/** Set of named item schemas. */
export type ItemSchemas<T extends Database> = {
	[K in keyof T]: DataSchema<Item<T[K]>>;
};

/**
 * Valid item object with specifed properties.
 * - An `Item` is a `Data` object with a string `.id` prop.
 * - Optional validator for `.id` must be a `KeySchema` and defaults to `KEY`.
 */
export const ITEM = <T extends Data>(props: Validators<T> | DataSchema<T>, id?: KeySchema): ItemSchema<Item<T>> =>
	props instanceof DataSchema ? new ItemSchema({ id, ...(props as DataSchema<Item<T>>) }) : new ItemSchema({ props, id });

/**
 * Valid item object or `null`.
 * - An `Item` is a `Data` object with a string `.id` prop.
 * - Optional validator for `.id` must be a `KeySchema` and defaults to `KEY`.
 */
export const OPTIONAL_ITEM = <T extends Data>(props: Validators<T> | DataSchema<T>, id?: KeySchema): OptionalSchema<Item<T>> =>
	OPTIONAL(ITEM(props, id));
