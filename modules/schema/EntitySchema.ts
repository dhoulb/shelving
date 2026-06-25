import { type ImmutableArray, isArrayItem } from "../util/array.js";
import { type Entity, getEntity } from "../util/entity.js";
import { NULLABLE } from "./NullableSchema.js";
import { StringSchema, type StringSchemaOptions } from "./StringSchema.js";

/**
 * Options for `EntitySchema`.
 *
 * @see https://shelving.cc/schema/EntitySchemaOptions
 */
export interface EntitySchemaOptions<T extends string> extends StringSchemaOptions {
	/** Restrict the allowed entity types; any other type is rejected. */
	readonly types?: ImmutableArray<T> | undefined;
}

/**
 * Schema that validates an `Entity` string combining a type and ID, e.g. `challenge:a1b2c3`.
 *
 * - The input must contain both a type and an ID separated by `:`, otherwise it is rejected.
 * - When `types` is set, the entity's type must be one of the allowed types.
 *
 * @example
 *  const schema = new EntitySchema({ types: ["challenge"] });
 *  schema.validate("challenge:a1b2c3"); // "challenge:a1b2c3"
 *
 * @see https://shelving.cc/schema/EntitySchema
 */
export class EntitySchema<T extends string> extends StringSchema {
	readonly types: ImmutableArray<T> | undefined;

	constructor({ one = "entity", title = "Entity", types, ...options }: EntitySchemaOptions<T>) {
		super({ one, title, ...options });
		this.types = types;
	}

	/** Additionally requires a `type:id` shape and, when `types` is set, a type within it. */
	override validate(unsafeValue: unknown = this.value): Entity<T> {
		const entity = super.validate(unsafeValue);
		const [type] = getEntity(entity);
		if (!type) throw "Must be entity";
		if (this.types && !isArrayItem(this.types, type)) throw "Invalid entity type";
		return entity as Entity<T>;
	}
}

/**
 * Sugar instance of `EntitySchema` for an entity string, e.g. `challenge:a1b2c3`. Equivalent to `new EntitySchema({})`.
 *
 * @example ENTITY.validate("challenge:a1b2c3") // "challenge:a1b2c3"
 * @see https://shelving.cc/schema/ENTITY
 */
export const ENTITY = new EntitySchema({});

/**
 * Sugar instance allowing an `ENTITY` or `null`. Equivalent to `NULLABLE(ENTITY)`.
 *
 * @example NULLABLE_ENTITY.validate("") // null
 * @see https://shelving.cc/schema/NULLABLE_ENTITY
 */
export const NULLABLE_ENTITY = NULLABLE(ENTITY);
