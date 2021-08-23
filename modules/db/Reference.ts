import { isFeedback } from "../feedback";
import { ObjectSchema, Validator } from "../schema";
import { assertInstance, Data } from "../util";
import { ReferenceValidationError } from "./errors";
import type { Database } from "./Database";

/**
 * Reference: a location in a database
 * - This class is a shared base for both `Document` and `Documents`
 */
export class Reference<T extends Data = Data> implements Validator<T> {
	readonly db: Database;
	readonly collection: string;
	readonly path: string;

	constructor(db: Database, collection: string, path: string) {
		this.db = db;
		this.collection = collection;
		this.path = path;
	}

	// Implement `Validator`
	validate(data: unknown, partial: true): Partial<T>;
	validate(data: unknown, partial?: false): T;
	validate(data: unknown, partial = false): T | Partial<T> {
		try {
			const schema = this.db.schemas[this.collection];
			assertInstance<ObjectSchema<T>>(schema, ObjectSchema);
			return schema.validate(data, partial);
		} catch (thrown: unknown) {
			throw isFeedback(thrown) ? new ReferenceValidationError(this, thrown) : thrown;
		}
	}

	// Implement `toString()`
	toString(): string {
		return this.path;
	}
}
