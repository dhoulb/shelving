import { Data, Datas, isObject, MutableObject, Results, Validatable, validate, Validator, Validators } from "../util/index.js";
import { Feedback, InvalidFeedback } from "../feedback/index.js";
import { Filters, Sorts, Slice, Query, EqualFilter } from "../query/index.js";
import { DocumentValidationError, QueryValidationError } from "./errors.js";

/** Database model describes a set of collections containing documents. */
export class Model<D extends Datas = Datas> {
	readonly validators: Validators<D>;
	constructor(schemas: Validators<D>) {
		this.validators = schemas;
	}

	/** Create a query on a collection in this model. */
	query<C extends keyof D & string>(collection: C): ModelQuery<D[C]> {
		return new ModelQuery(this.validators[collection], collection);
	}

	/** Reference a document in a collection in this model. */
	doc<C extends keyof D & string>(collection: C, id: string): ModelDocument<D[C]> {
		return new ModelDocument(this.validators[collection], collection, id);
	}
}

/** Query on a collection in a database model. */
export class ModelQuery<T extends Data = Data> extends Query<T> implements Validatable<Results<T>> {
	readonly validator: Validator<T>;
	readonly collection: string;
	constructor(schema: Validator<T>, collection: string, filters?: Filters<T>, sorts?: Sorts<T>, slice?: Slice<T>) {
		super(filters, sorts, slice);
		this.validator = schema;
		this.collection = collection;
	}

	/** Reference a document in this query's collection. */
	doc(id: string): ModelDocument<T> {
		return new ModelDocument(this.validator, this.collection, id);
	}

	// Implement `Validator`
	validate(unsafeValue?: unknown): Results<T> {
		if (!isObject(unsafeValue)) throw new QueryValidationError(this, new InvalidFeedback("Must be object"));
		const validated: MutableObject<T> = {};
		const invalids: MutableObject<Feedback> = {};
		let invalid = false;
		for (const [id, data] of Object.entries(unsafeValue)) {
			try {
				validated[id] = validate(data, this.validator);
			} catch (thrown) {
				if (!(thrown instanceof Feedback)) throw thrown;
				invalids[id] = thrown;
				invalid = true;
			}
		}
		if (invalid) throw new QueryValidationError(this, new InvalidFeedback("Invalid documents", invalids));
		return validated;
	}

	// Override to include the collection name.
	override toString(): string {
		return `${this.collection}?${super.toString()}`;
	}
}

/** Reference to a document in a collection in a database model. */
export class ModelDocument<T extends Data = Data> implements Validatable<T> {
	readonly validator: Validator<T>;
	readonly collection: string;
	readonly id: string;
	constructor(schema: Validator<T>, collection: string, id: string) {
		this.validator = schema;
		this.collection = collection;
		this.id = id;
	}

	/** Get an 'optional' reference to this document (uses a `ModelQuery` with an `id` filter). */
	get optional(): ModelQuery<T> {
		return new ModelQuery(this.validator, this.collection, new Filters(new EqualFilter("id", this.id)));
	}

	/** Create a query on this document's collection. */
	query(): ModelQuery<T> {
		return new ModelQuery(this.validator, this.collection);
	}

	// Implement `Validator`
	validate(unsafeValue?: unknown): T {
		try {
			return validate(unsafeValue, this.validator);
		} catch (thrown) {
			throw thrown instanceof Feedback ? new DocumentValidationError(this, thrown) : thrown;
		}
	}

	// Implement toString()
	toString(): string {
		return `${this.collection}/${this.id}`;
	}
}
