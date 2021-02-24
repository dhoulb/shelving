import type { DataSchemas } from "../schema";
import type { Document } from "./Document";
import type { Collection } from "./Collection";

/**
 * Database: combines a set of document and collection loci for the root level of the database, and links them to a Provider.
 *
 * @param documents Set of loci describing named documents at the root level of the database.
 * @param collections Set of loci describing collections at the root level of the database.
 * @param provider Provider that allows data to be read/written.
 */
export interface Database<D extends DataSchemas = DataSchemas, C extends DataSchemas = DataSchemas> {
	/** Any nested documents that sit below this data. */
	readonly documents: D;

	/** Any nested collections that sit below this data. */
	readonly collections: C;

	/**
	 * Get a `Document` ref for a named subdocument of this document.
	 * @param name Document name, e.g. `options`
	 * @example `db.collection("dogs").doc("fido").doc("options").get()`
	 */
	doc<K extends keyof D>(name: K): Document<D[K]["type"], D[K]["documents"], D[K]["collections"]>;

	/**
	 * Get a `Collection` ref for a named subcollection of this document.
	 * @param name Collection name, e.g. `puppies`
	 * @example `db.collection("dogs").doc("fido").collection("puppies").get()`
	 */
	collection<K extends keyof C>(name: K): Collection<C[K]["type"], C[K]["documents"], C[K]["collections"]>;
}
