import type { Collections } from "../collection/Collection.js";
import type { DBProvider } from "../provider/DBProvider.js";

/** Base class for database schema migrators. */
export abstract class DBMigrator<T extends DBProvider = DBProvider> {
	readonly provider: T;

	constructor(provider: T) {
		this.provider = provider;
	}

	abstract migrate(...collections: Collections): Promise<void>;
}
