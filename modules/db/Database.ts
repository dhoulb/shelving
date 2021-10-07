import type { Datas, Validators } from "../util";
import type { Provider } from "./Provider";
import { Document } from "./Document";
import { Documents } from "./Documents";

/**
 * Database: combines a set of document and collection loci for the root level of the database, and links them to a Provider.
 *
 * @param documents Set of loci describing named documents at the root level of the database.
 * @param collections Set of loci describing collections at the root level of the database.
 * @param provider Provider that allows data to be read/written.
 */
export class Database<T extends Datas = Datas> {
	/** List of schemas validators for the collections in this database. */
	readonly schemas: Validators<T>;

	/** The provider that powers this database. */
	readonly provider: Provider;

	constructor(schemas: Validators<T>, provider: Provider) {
		this.schemas = schemas;
		this.provider = provider;
	}

	/**
	 * Get a `Documents` ref for a set of documents in a collection in this database.
	 * @param name Collection name, e.g. `puppies`
	 * @example `db.docs("dogs").doc("fido").get()`
	 */
	docs<C extends keyof T & string>(collection: C): Documents<T[C]> {
		return new Documents<T[C]>(this as unknown as Database, collection); // Unknown cast allows this to be used.
	}

	/**
	 * Get a `Document` ref for a document in a collection in this database.
	 * @param name Document name, e.g. `fido`
	 * @example `db.doc("dogs", "fido").get()`
	 */
	doc<C extends keyof T & string>(collection: C, id: string): Document<T[C]> {
		return new Document<T[C]>(this as unknown as Database, collection, id); // Unknown cast allows this to be used.
	}
}
