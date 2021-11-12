import type { Datas, Validators } from "../util/index.js";
import type { Query } from "../query/index.js";
import type { Provider } from "./Provider.js";
import { Document, Documents } from "./Reference.js";

/**
 * Database: combines a set of document and collection loci for the root level of the database, and links them to a Provider.
 *
 * @param documents Set of loci describing named documents at the root level of the database.
 * @param collections Set of loci describing collections at the root level of the database.
 * @param provider Provider that allows data to be read/written.
 */
export class Database<D extends Datas = Datas> {
	readonly schemas: Validators<D>;
	readonly provider: Provider;
	constructor(schemas: Validators<D>, provider: Provider) {
		this.schemas = schemas;
		this.provider = provider;
	}

	/**
	 * Get a `Documents` ref for a set of documents in a collection in this database.
	 * @param collection Collection name, e.g. `puppies`
	 * @param query Optional query to create the `Documents` reference with.
	 * @example `db.docs("dogs").doc("fido").get()`
	 */
	docs<C extends keyof D & string>(collection: C, query?: Query<D[C]>): DatabaseDocuments<D, C> {
		return new DatabaseDocuments<D, C>(this, collection, query);
	}

	/**
	 * Get a `Document` ref for a document in a collection in this database.
	 * @param collection Document name, e.g. `fido`
	 * @param id Unique ID of the document in the collection.
	 * @example `db.doc("dogs", "fido").get()`
	 */
	doc<C extends keyof D & string>(collection: C, id: string): DatabaseDocument<D, C> {
		return new DatabaseDocument<D, C>(this, collection, id);
	}
}

/** A documents reference within a specific database. */
export class DatabaseDocuments<D extends Datas, C extends keyof D & string> extends Documents<D[C]> {
	readonly db: Database<D>;
	override readonly collection: C;
	constructor(db: Database<D>, collection: C, query?: Query<D[C]>) {
		super(db.provider, db.schemas[collection], collection, query);
		this.db = db;
		this.collection = collection;
	}
	// Override to return a `DatabaseDocument` reference instead of a plain `Document` reference.
	override doc(id: string): DatabaseDocument<D, C> {
		return new DatabaseDocument(this.db, this.collection, id);
	}
}

/** A document reference within a specific database. */
export class DatabaseDocument<D extends Datas, C extends keyof D & string> extends Document<D[C]> {
	readonly db: Database<D>;
	override readonly collection: C;
	constructor(db: Database<D>, collection: C, id: string) {
		super(db.provider, db.schemas[collection], collection, id);
		this.db = db;
		this.collection = collection;
	}
	// Override to return a `DatabaseDocuments` reference instead of a plain `Documents` reference.
	override docs(query?: Query<D[C]>): DatabaseDocuments<D, C> {
		return new DatabaseDocuments(this.db, this.collection, query);
	}
}
