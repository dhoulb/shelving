/** Options that apply to get or subscribe operations. */
export type DatabaseReadOptions = {
	/**
	 * Whether to apply validation to the returned value.
	 * - Warning: This allow **ANY** data to be directly set to the database.
	 */
	readonly validate?: boolean;
	/**
	 * Whether the specified document must exist.
	 * - Throws a `RequiredError` if the document does not exist.
	 */
	readonly required?: boolean;
};

/** Options that apply to set or update operations. */
export type DatabaseWriteOptions = {
	/**
	 * Whether to apply validation to the input value .
	 * - Warning: This allow **ANY** data to be directly set to the database.
	 */
	readonly validate?: boolean;
	/**
	 * Whether the set operation is required
	 * - If this is `false` then `update()` won't throw `RequiredError` if the document doesnt exist (it'll silently do nothing).
	 */
	readonly required?: boolean;
};
