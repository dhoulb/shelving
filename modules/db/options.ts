/** Options that modify a get operation. */
export type GetOptions = {
	/** Throw a `RequiredError` if the document does not exist (defaults to `false`). */
	required?: boolean;
};

export const REQUIRED = { required: true } as const;

/** Options that modify a set operation. */
export type SetOptions = {
	/**
	 * Whether to apply validation to the input value (defaults to `true`).
	 * - Warning: This allow **ANY** data to be directly set to the database.
	 */
	validate?: boolean;
};

export const UNVALIDATED = { validate: false } as const;

/** Options that modify a delete operation. */
export type DeleteOptions = {
	/** Whether to delete this document and all its children (defaults to false). */
	deep?: boolean;
};

export const DEEP = { deep: true } as const;
