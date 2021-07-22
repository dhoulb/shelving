import { Data, Result, Results, Unsubscriber, ImmutableObject, MutableObject, Observer, isAsync } from "../util";
import { ValidationError } from "../errors";
import { Feedback, InvalidFeedback, isFeedback } from "../feedback";
import { ObjectSchema } from "../schema";
import { DerivingStream } from "../stream";
import type { Provider } from "./Provider";
import type { Document } from "./Document";
import type { Documents } from "./Documents";

/**
 * Validation provider: validates any values that are read from or written a the source provider.
 */
export class ValidationProvider implements Provider {
	/** The source provider. */
	readonly #source: Provider;

	constructor(source: Provider) {
		this.#source = source;
	}

	getDocument<T extends Data>(ref: Document<T>): Result<T> | Promise<Result<T>> {
		const result = this.#source.getDocument(ref);
		if (isAsync(result)) return this.#awaitGetDocument(ref, result);
		return result ? validateData(ref, result) : undefined;
	}
	async #awaitGetDocument<T extends Data>(ref: Document<T>, asyncResult: Promise<Result<T>>): Promise<Result<T>> {
		const result = await asyncResult;
		return result ? validateData(ref, result) : undefined;
	}

	onDocument<T extends Data>(ref: Document<T>, observer: Observer<Result<T>>): Unsubscriber {
		const stream = new DerivingStream<Result<T>, Result<T>>(v => (v ? validateData(ref, v) : undefined));
		stream.subscribe(observer);
		return this.#source.onDocument(ref, stream);
	}

	addDocument<T extends Data>(ref: Documents<T>, data: T): string | Promise<string> {
		return this.#source.addDocument(ref, validateData(ref, data));
	}

	setDocument<T extends Data>(ref: Document<T>, data: T): void | Promise<void> {
		return this.#source.setDocument(ref, validateData(ref, data));
	}

	updateDocument<T extends Data>(ref: Document<T>, partial: Partial<T>): void | Promise<void> {
		return this.#source.updateDocument(ref, validateData(ref, partial, true));
	}

	deleteDocument<T extends Data>(ref: Document<T>): void | Promise<void> {
		return this.#source.deleteDocument(ref);
	}

	getDocuments<T extends Data>(ref: Documents<T>): Results<T> | Promise<Results<T>> {
		const results = this.#source.getDocuments(ref);
		if (isAsync(results)) return this.#awaitGetDocuments(ref, results);
		return validateResults(ref, results);
	}
	async #awaitGetDocuments<T extends Data>(ref: Documents<T>, asyncResult: Promise<Results<T>>): Promise<Results<T>> {
		return validateResults(ref, await asyncResult);
	}

	onDocuments<T extends Data>(ref: Documents<T>, observer: Observer<Results<T>>): Unsubscriber {
		const stream = new DerivingStream<Results<Data>, Results<T>>(v => validateResults(ref, v));
		stream.subscribe(observer);
		return this.#source.onDocuments(ref, stream);
	}

	setDocuments<T extends Data>(ref: Documents<T>, data: T): void | Promise<void> {
		return this.#source.setDocuments(ref, validateData(ref, data));
	}

	updateDocuments<T extends Data>(ref: Documents<T>, partial: Partial<T>): void | Promise<void> {
		return this.#source.updateDocuments(ref, validateData(ref, partial, true));
	}

	deleteDocuments<T extends Data>(ref: Documents<T>): void | Promise<void> {
		return this.#source.deleteDocuments(ref);
	}
}

/** Validate a single document at this path. */
function validateData<T extends Data>(ref: Document<T> | Documents<T>, data: ImmutableObject, partial = false): T {
	try {
		const schema = ref.db.schemas[ref.collection] as ObjectSchema<T>;
		return schema.validate(data, partial);
	} catch (thrown: unknown) {
		if (isFeedback(thrown)) throw new ValidationError(`Invalid ${partial ? "partial data" : "data"} for: "${ref.path}"`, thrown);
		else throw thrown;
	}
}

/** Validate a set of documents at this path. */
function validateResults<T extends Data>(ref: Documents<T>, results: ImmutableObject<ImmutableObject>): Results<T> {
	const validated: MutableObject<T> = {};
	const invalids: MutableObject<Feedback> = {};
	let invalid = false;
	for (const [id, data] of Object.entries(results)) {
		try {
			const schema = ref.db.schemas[ref.collection] as ObjectSchema<T>;
			validated[id] = schema.validate(data);
		} catch (thrown) {
			if (isFeedback(thrown)) invalids[id] = thrown;
			else throw thrown;
			invalid = true;
		}
	}
	if (invalid) throw new ValidationError(`Invalid documents for: "${ref.path}"`, new InvalidFeedback("Invalid documents", invalids));
	return validated;
}
