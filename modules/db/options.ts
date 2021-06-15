/** Options that apply to set or update operations. */
export type DatabaseWriteOptions = {
	/**
	 * Whether the set operation is required
	 * - If this is `false` then `update()` won't throw `RequiredError` if the document doesnt exist (it'll silently do nothing).
	 */
	readonly required?: boolean;
};
