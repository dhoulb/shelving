import { EmptyObject, Cloneable, cloneObject } from "shelving/tools";
import { DataSchemas } from "shelving/schema";
import { Collection } from "./Collection";
import { DOCUMENT_PATH } from "./constants";
import type { Provider } from "./Provider";
import { Document } from "./Document";

/**
 * Database: combines a set of document and collection loci for the root level of the database, and links them to a Provider.
 *
 * @param documents Set of loci describing named documents at the root level of the database.
 * @param collections Set of loci describing collections at the root level of the database.
 * @param provider Provider that allows data to be read/written.
 */
export class Database<D extends DataSchemas, C extends DataSchemas, P extends Provider> implements Cloneable {
	readonly documents: D;
	readonly collections: C;
	readonly provider: P;

	constructor(documents: D, collections: C, provider: P) {
		this.documents = documents;
		this.collections = collections;
		this.provider = provider;
	}

	/**
	 * Get a `Document` ref for a named subdocument of this document.
	 * @param name Document name, e.g. `options`
	 * @example `db.collection("dogs").doc("fido").doc("options").get()`
	 */
	doc<K extends keyof D>(name: K): Document<D[K]["DATA"], D[K]["documents"], D[K]["collections"], P> {
		return new Document(this.documents[name], this.provider, DOCUMENT_PATH, name as string);
	}

	/**
	 * Get a `Collection` ref for a named subcollection of this document.
	 * @param name Collection name, e.g. `puppies`
	 * @example `db.collection("dogs").doc("fido").collection("puppies").get()`
	 */
	collection<K extends keyof C>(name: K): Collection<C[K]["DATA"], C[K]["documents"], C[K]["collections"], P> {
		return new Collection(this.collections[name], this.provider, name as string);
	}

	/**
	 * Reset the database to its empty state and destroy all data.
	 * @return `void` or a `Promise` that resolves when the database has been reset successfully.
	 */
	reset(): Promise<void> {
		return this.provider.reset();
	}

	// Implement Cloneable.
	clone(): this {
		return cloneObject(this);
	}
}

/** Options for a database instance. */
type DatabaseOptions<D extends DataSchemas, C extends DataSchemas, P extends Provider> = {
	documents?: D;
	collections?: C;
	provider: P;
};

/** Create a new Database instance. */
export const createDatabase = <D extends DataSchemas = EmptyObject, C extends DataSchemas = EmptyObject, P extends Provider = Provider>({
	documents = {} as D,
	collections = {} as C,
	provider,
}: DatabaseOptions<D, C, P>): Database<D, C, P> => new Database(documents, collections, provider);
