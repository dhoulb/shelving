import { ValueFeedback } from "../feedback/Feedback.js";
import { type ImmutableArray, isItem } from "../util/array.js";
import { type Entity, getEntity } from "../util/entity.js";
import { NULLABLE } from "./NullableSchema.js";
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
		const [type] = getEntity(entity);
		if (!type) throw new ValueFeedback("Must be entity", unsafeValue);
		if (this.types && !isItem(this.types, type)) throw new ValueFeedback("Invalid entity type", type);
		return entity as Entity<T>;
	}
}

/** Valid file, e.g. `challenge:a1b2c3` */
export const ENTITY = new EntitySchema({});

/** Valid optional file, e.g. `file.txt`, or `null` */
export const NULLABLE_ENTITY = NULLABLE(ENTITY);
