import { type ImmutableArray, isArrayItem } from "../util/array.js";
import { type Entity, getEntity } from "../util/entity.js";
import { NULLABLE } from "./NullableSchema.js";
import { StringSchema, type StringSchemaOptions } from "./StringSchema.js";

/**
 * Options for `EntitySchema`.
 *
 * @see https://dhoulb.github.io/shelving/schema/EntitySchema/EntitySchemaOptions
 */
export interface EntitySchemaOptions<T extends string> extends StringSchemaOptions {
	/** Restrict the allowed entity types; any other type is rejected. */
	readonly types?: ImmutableArray<T> | undefined;
}

/**
 * Schema that validates an [`Entity`](/util/entity/Entity) string combining a type and ID, e.g. `challenge:a1b2c3`.
 *
 * - The input must contain both a type and an ID separated by `:`, otherwise it is rejected.
 * - When `types` is set, the entity's type must be one of the allowed types.
 *
 * @example
 *  const schema = new EntitySchema({ types: ["challenge"] });
 *  schema.validate("challenge:a1b2c3"); // "challenge:a1b2c3"
 *
 * @see https://dhoulb.github.io/shelving/schema/EntitySchema/EntitySchema
 */
export class EntitySchema<T extends string> extends StringSchema {
	readonly types: ImmutableArray<T> | undefined;

	/**
	 * Create a new `EntitySchema`.
	 */
	constructor({ one = "entity", title = "Entity", types, ...options }: EntitySchemaOptions<T>) {
		super({ one, title, ...options });
		this.types = types;
	}

	/**
	 * Validate an unknown value as an [`Entity`](/util/entity/Entity) string with a valid type and ID.
	 *
	 * @param unsafeValue The unknown input value to validate (defaults to this schema's `value`).
	 * @returns The valid `Entity` string.
	 * @throws `string` `"Must be entity"` if the value lacks a type and ID, or `"Invalid entity type"` if its type is not in the allowed `types`. Also throws any `string` from the underlying [`StringSchema`](/schema/StringSchema).
	 * @example schema.validate("challenge:a1b2c3") // "challenge:a1b2c3"
	 * @see https://dhoulb.github.io/shelving/schema/EntitySchema/EntitySchema/validate
	 */
	override validate(unsafeValue: unknown = this.value): Entity<T> {
		const entity = super.validate(unsafeValue);
		const [type] = getEntity(entity);
		if (!type) throw "Must be entity";
		if (this.types && !isArrayItem(this.types, type)) throw "Invalid entity type";
		return entity as Entity<T>;
	}
}

/**
 * Sugar instance of [`EntitySchema`](/schema/EntitySchema) for an entity string, e.g. `challenge:a1b2c3`. Equivalent to `new EntitySchema({})`.
 *
 * @example ENTITY.validate("challenge:a1b2c3") // "challenge:a1b2c3"
 * @see https://dhoulb.github.io/shelving/schema/EntitySchema/ENTITY
 */
export const ENTITY = new EntitySchema({});

/**
 * Sugar instance allowing an [`ENTITY`](/schema/ENTITY) or `null`. Equivalent to `NULLABLE(ENTITY)`.
 *
 * @example NULLABLE_ENTITY.validate("") // null
 * @see https://dhoulb.github.io/shelving/schema/EntitySchema/NULLABLE_ENTITY
 */
export const NULLABLE_ENTITY = NULLABLE(ENTITY);
