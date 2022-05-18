import { Validator, Key, Datas, Validators, ValidatorType } from "../util/index.js";
import type { Provider } from "../provider/Provider.js";
import { Filters, Sorts, FilterProps, SortKeys } from "../query/index.js";
import { DocumentReference, QueryReference } from "./Reference.js";

/**
 * Combines a database model and a provider.
 *
 * @param documents Set of loci describing named documents at the root level of the database.
 * @param collections Set of loci describing collections at the root level of the database.
 * @param provider Provider that allows data to be read/written.
 */
// Note: typing this with `Validators` rather than raw `Datas` works better for inference — type for props in each collection tends to get lost.
export class Database<V extends Validators<Datas> = Validators<Datas>> {
	readonly validators: V;
	readonly provider: Provider;
	constructor(validators: V, provider: Provider) {
		this.validators = validators;
		this.provider = provider;
	}

	/** Create a query on a collection in this model. */
	query<K extends Key<V>>(collection: K, filters?: FilterProps<ValidatorType<V[K]>>, sorts?: SortKeys<ValidatorType<V[K]>>, limit?: number | null): QueryReference<ValidatorType<V[K]>> {
		return new QueryReference<ValidatorType<V[K]>>(this, this.validators[collection] as Validator<ValidatorType<V[K]>>, collection, filters && Filters.on(filters), sorts && Sorts.on(sorts), limit);
	}

	/** Reference a document in a collection in this model. */
	doc<K extends Key<V>>(collection: K, id: string): DocumentReference<ValidatorType<V[K]>> {
		return new DocumentReference(this, this.validators[collection] as Validator<ValidatorType<V[K]>>, collection, id);
	}

	/**
	 * Create a new document with a random ID.
	 * - Created document is guaranteed to have a unique ID.
	 *
	 * @param collection Name of the collection to add the document to.
	 * @param data Complete data to set the document to.
	 * @return String ID for the created document (possibly promised).
	 */
	add<K extends Key<V>>(collection: K, data: ValidatorType<V[K]>): string | PromiseLike<string> {
		return this.query(collection).add(data);
	}
}
