import { Feedback } from "../feedback/Feedback.js";
import { type ImmutableArray, isArrayItem } from "../util/array.js";
import { type Entity, splitOptionalEntity } from "../util/entity.js";
import { OPTIONAL } from "./OptionalSchema.js";
import { StringSchema, type StringSchemaOptions } from "./StringSchema.js";

/** Allowed options for `EntitySchema` with specific types */
export interface EntitySchemaOptions<T extends string> extends StringSchemaOptions {
	readonly types?: ImmutableArray<T> | undefined;
}

/** Validate a file name matching one or more extensions. */
export class EntitySchema<T extends string> extends StringSchema {
	readonly types: ImmutableArray<T> | undefined;
	constructor({ types, title = "Entity", ...options }: EntitySchemaOptions<T>) {
		super({ title, ...options });
		this.types = types;
	}
	override validate(unsafeValue: unknown = this.value): Entity<T> {
		const entity = super.validate(unsafeValue);
		const [type] = splitOptionalEntity(entity);
		if (!type) throw new Feedback("Must be entity", unsafeValue);
		if (this.types && !isArrayItem(this.types, type)) throw new Feedback("Invalid entity type", type);
		return entity as Entity<T>;
	}
}

/** Valid file, e.g. `challenge:a1b2c3` */
export const ENTITY = new EntitySchema({});

/** Valid optional file, e.g. `file.txt`, or `null` */
export const OPTIONAL_ENTITY = OPTIONAL(ENTITY);
