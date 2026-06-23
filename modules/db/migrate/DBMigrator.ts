import type { Collections } from "../collection/Collection.js";
import type { DBProvider } from "../provider/DBProvider.js";

/**
 * Base class for database schema migrators that bring a provider's storage into line with a set of collection schemas.
 *
 * - Subclasses implement `migrate()` for a specific backend (e.g. SQL via `SQLMigrator`).
 *
 * @example
 *  class MyMigrator extends DBMigrator { async migrate(...collections) { ... } }
 *  await new MyMigrator(provider).migrate(users, posts);
 * @see https://shelving.cc/db/DBMigrator
 */
export abstract class DBMigrator<T extends DBProvider = DBProvider> {
	/**
	 * The database provider whose storage this migrator updates.
	 * @see https://shelving.cc/db/DBMigrator/provider
	 */
	readonly provider: T;

	/**
	 * Create a migrator bound to a database provider.
	 *
	 * @param provider The database provider whose storage this migrator updates.
	 * @example new DBMigrator(provider)
	 */
	constructor(provider: T) {
		this.provider = provider;
	}

	/**
	 * Bring the provider's storage into line with the given collection schemas.
	 *
	 * @param collections The collections whose schemas the storage should match.
	 * @returns Promise that resolves once migration has completed.
	 * @throws {UnimplementedError} If a schema feature can't be represented by the backend.
	 * @example await migrator.migrate(users, posts)
	 * @see https://shelving.cc/db/DBMigrator/migrate
	 */
	abstract migrate(...collections: Collections): Promise<void>;
}
