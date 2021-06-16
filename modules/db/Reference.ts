import type { Data } from "../util";
import type { Validator } from "../schema";

/**
 * Reference interface: shared base for both Document and Documents that defines a single path in the database.
 */
export interface Reference<T extends Data = Data> {
	/** Schema validator for this path. */
	readonly schema: Validator<T>;

	/** String path. */
	readonly path: string;

	// Must implement toString()
	toString(): string;
}
