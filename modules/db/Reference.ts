import type { Cloneable } from "../clone";
import type { ImmutableObject } from "../object";
import type { Changes, Data, Change, Results } from "../data";

/**
 * Reference: a reference to a specific collection, query, or document in a database.
 * - Single base interface which Document and Collection both extend.
 *
 * @param T Type for data stored at this reference.
 * @param D Set of named `DataSchema` instances for documents stored under this reference.
 * @param C Set of named `DataSchema` instances for collections stored under this reference.
 * @param P `Provider` instance to access data.
 */
export interface Reference<T extends Data = Data> extends Cloneable {
	/** Full path to the data (e.g. `dogs/fido`) */
	readonly path: string;

	/**
	 * Validate unknown data and return valid data for this collection.
	 *
	 * @param data The (potentially invalid) input data.
	 * @returns Data object matching this reference's schema.
	 * - If the input data is already exactly valid, the exact same instance is returned.
	 * @throws InvalidError If the input data is not valid and cannot be fixed.
	 */
	validate(data: ImmutableObject): T;

	/**
	 * Validate an unknown value and return a valid change for this Collection.
	 *
	 * @param change The (potentially invalid) partial data, or `undefined` to indicate a deleted document.
	 * @returns Change matching this reference's schema.
	 * - If the input data is already exactly valid, the exact same instance is returned.
	 * @throws InvalidError If the input change is not valid and cannot be fixed.
	 */
	validateChange(change: ImmutableObject | undefined): Change<T>;

	/**
	 * Validate a set of results to this collection.
	 *
	 * @param results An object indexed by ID containing document data.
	 * @returns The set of results after validation.
	 */
	validateResults(results: ImmutableObject): Results<T>;

	/**
	 * Validate a set of changes to this collection.
	 *
	 * @param changes An object indexed by ID containing either partial values to merge in, or `undefined` to indicate the document should be deleted.
	 * @returns The set of changes after validation.
	 */
	validateChanges(changes: ImmutableObject): Changes<T>;

	// Must implement toString()
	toString(): string;
}
