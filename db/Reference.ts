import { Feedback, isFeedback } from "shelving/feedback";
import { ValidationError, RequiredError } from "shelving/errors";
import { Cloneable, cloneObject, ReadonlyObject, Changes, Data, Change, Results } from "shelving/tools";
import type { DataSchema, DataSchemas } from "shelving/schema";
import type { Provider } from "./Provider";

/** Error thrown when a collection document doesn't validate. */
export class ReferenceValidationError extends ValidationError {
	reference: Reference;
	constructor(reference: Reference, feedback: Feedback, value: unknown) {
		super(`Invalid value for: "${reference.path}"`, feedback, value);
		this.reference = reference;
	}
}

/** Error thrown when a document doesn't exist. */
export class ReferenceRequiredError extends RequiredError {
	reference: Reference;
	constructor(reference: Reference) {
		super(`Path does not exist: "${reference.path}"`);
		this.reference = reference;
	}
}

/**
 * Reference: a reference to a specific collection, query, or document in a database.
 *
 * @param T Type for data stored at this reference.
 * @param D Set of named `DataSchema` instances for documents stored under this reference.
 * @param C Set of named `DataSchema` instances for collections stored under this reference.
 * @param P `Provider` instance to access data.
 */
export abstract class Reference<T extends Data = Data, D extends DataSchemas = DataSchemas, C extends DataSchemas = DataSchemas, P extends Provider = Provider>
	implements Cloneable {
	/** DataSchema describing the data's type. */
	readonly schema: DataSchema<T, D, C>;
	/** Provider this reference gets data from. */
	readonly provider: P;
	/** Full path to the data (e.g. `dogs/fido`) */
	readonly path: string;

	constructor(locus: DataSchema<T, D, C>, provider: P, path: string) {
		this.schema = locus;
		this.provider = provider;
		this.path = path;
	}

	/**
	 * Validate unknown data and return valid data for this collection.
	 *
	 * @param data The (potentially invalid) input data.
	 * @returns Data object matching this reference's schema.
	 * - If the input data is already exactly valid, the exact same instance is returned.
	 * @throws InvalidError If the input data is not valid and cannot be fixed.
	 */
	validate(data: ReadonlyObject): T {
		try {
			return this.schema.validate(data);
		} catch (thrown: unknown) {
			if (isFeedback(thrown)) throw new ReferenceValidationError(this, thrown, data);
			else throw thrown;
		}
	}

	/**
	 * Validate an unknown value and return a valid change for this Collection.
	 *
	 * @param change The (potentially invalid) partial data, or `undefined` to indicate a deleted document.
	 * @returns Change matching this reference's schema.
	 * - If the input data is already exactly valid, the exact same instance is returned.
	 * @throws InvalidError If the input change is not valid and cannot be fixed.
	 */
	validateChange(change: ReadonlyObject | undefined): Change<T> {
		try {
			return this.schema.change.validate(change);
		} catch (thrown: unknown) {
			if (isFeedback(thrown)) throw new ReferenceValidationError(this, thrown, change);
			else throw thrown;
		}
	}

	/**
	 * Validate a set of results to this collection.
	 *
	 * @param results An object indexed by ID containing document data.
	 * @returns The set of results after validation.
	 */
	validateResults(results: ReadonlyObject): Results<T> {
		try {
			return this.schema.results.validate(results);
		} catch (thrown: unknown) {
			if (isFeedback(thrown)) throw new ReferenceValidationError(this, thrown, results);
			else throw thrown;
		}
	}

	/**
	 * Validate a set of changes to this collection.
	 *
	 * @param changes An object indexed by ID containing either partial values to merge in, or `undefined` to indicate the document should be deleted.
	 * @returns The set of changes after validation.
	 */
	validateChanges(changes: ReadonlyObject): Changes<T> {
		try {
			return this.schema.changes.validate(changes);
		} catch (thrown: unknown) {
			if (isFeedback(thrown)) throw new ReferenceValidationError(this, thrown, changes);
			else throw thrown;
		}
	}

	// Implement toString()
	toString(): string {
		return this.path;
	}

	// Implement Cloneable.
	clone(): this {
		return cloneObject(this);
	}
}
