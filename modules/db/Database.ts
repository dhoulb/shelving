import type { Datas } from "../util/data";
import type { Validators } from "../schema";
import { Document } from "./Document";
import { Documents } from "./Documents";
import type { Provider } from "./Provider";

/**
 * Database: combines a set of document and collection loci for the root level of the database, and links them to a Provider.
 *
 * @param documents Set of loci describing named documents at the root level of the database.
 * @param collections Set of loci describing collections at the root level of the database.
 * @param provider Provider that allows data to be read/written.
 */
export class Database<C extends Datas = Datas> {
	/** List of schemas validators for the collections in this database. */
	readonly schemas: Validators<C>;

	/** The provider that powers this database. */
	readonly provider: Provider;

	constructor(schemas: Validators<C>, provider: Provider) {
		this.schemas = schemas;
		this.provider = provider;
	}

	/**
	 * Get a `Documents` ref for a set of documents in a collection in this database.
	 * @param name Collection name, e.g. `puppies`
	 * @example `db.docs("dogs").doc("fido").get()`
	 */
	docs<K extends keyof C>(collection: K): Documents<C[K]> {
		// @ts-expect-error Documents instances should only be created from databases.
		return new Documents(this.schemas[collection], this.provider, collection as string);
	}

	/**
	 * Get a `Document` ref for a document in a collection in this database.
	 * @param name Document name, e.g. `fido`
	 * @example `db.docs("dogs", "fido").get()`
	 */
	doc<K extends keyof C>(collection: K, id: string): Document<C[K]> {
		// @ts-expect-error Document instances should only be created from databases.
		return new Document(this.schemas[collection], this.provider, collection as string, id);
	}
}
