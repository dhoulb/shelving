import { Data, Result, Results, Unsubscriber, ImmutableObject, MutableObject, Observer, isAsync } from "../util";
import { ValidationError } from "../errors";
import { Feedback, InvalidFeedback, isFeedback } from "../feedback";
import { ObjectSchema, Schema } from "../schema";
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

	getDocument(ref: Document): Result | Promise<Result> {
		const result = this.#source.getDocument(ref);
		if (isAsync(result)) return this.#awaitGetDocument(ref, result);
		return result ? validateData(ref, result) : undefined;
	}
	async #awaitGetDocument(ref: Document, asyncResult: Promise<Result>): Promise<Result> {
		const result = await asyncResult;
		return result ? validateData(ref, result) : undefined;
	}

	onDocument(ref: Document, observer: Observer<Result>): Unsubscriber {
		const stream = new DerivingStream<Result, Result>(v => (v ? validateData(ref, v) : undefined));
		stream.subscribe(observer);
		return this.#source.onDocument(ref, stream);
	}

	addDocument(ref: Documents, data: Data): string | Promise<string> {
		return this.#source.addDocument(ref, validateData(ref, data, true));
	}

	setDocument(ref: Document, data: Data): void | Promise<void> {
		return this.#source.setDocument(ref, validateData(ref, data, true));
	}

	updateDocument(ref: Document, data: Partial<Data>): void | Promise<void> {
		return this.#source.updateDocument(ref, validateData(ref, data, true));
	}

	deleteDocument(ref: Document): void | Promise<void> {
		return this.#source.deleteDocument(ref);
	}

	getDocuments(ref: Documents): Results | Promise<Results> {
		const results = this.#source.getDocuments(ref);
		if (isAsync(results)) return this.#awaitGetDocuments(ref, results);
		return validateResults(ref, results);
	}
	async #awaitGetDocuments(ref: Documents, asyncResult: Promise<Results>): Promise<Results> {
		return validateResults(ref, await asyncResult);
	}

	onDocuments(ref: Documents, observer: Observer<Results>): Unsubscriber {
		const stream = new DerivingStream<Results<Data>, Results>(v => validateResults(ref, v));
		stream.subscribe(observer);
		return this.#source.onDocuments(ref, stream);
	}

	setDocuments(ref: Documents, data: Data): void | Promise<void> {
		return this.#source.setDocuments(ref, validateData(ref, data, true));
	}

	updateDocuments(ref: Documents, data: Partial<Data>): void | Promise<void> {
		return this.#source.updateDocuments(ref, validateData(ref, data, true));
	}

	deleteDocuments(ref: Documents): void | Promise<void> {
		return this.#source.deleteDocuments(ref);
	}
}

/** Validate a single document at this path. */
function validateData(ref: Document | Documents, data: Partial<Data>, partial: true): Data;
function validateData(ref: Document | Documents, data: Data, partial?: boolean): Data;
function validateData(ref: Document | Documents, data: Data | Partial<Data>, partial?: boolean): Data {
	try {
		const schema = ref.db.schemas[ref.collection];
		return schema && schema instanceof ObjectSchema ? schema.validate(data, partial) : data;
	} catch (thrown: unknown) {
		if (isFeedback(thrown)) throw new ValidationError(`Invalid ${partial ? "partial data" : "data"} for: "${ref.path}"`, thrown);
		else throw thrown;
	}
}

/** Validate a set of documents at this path. */
function validateResults(ref: Documents, results: ImmutableObject<ImmutableObject>): Results {
	const validated: MutableObject<Data> = {};
	const invalids: MutableObject<Feedback> = {};
	let invalid = false;
	for (const [id, data] of Object.entries(results)) {
		try {
			const schema = ref.db.schemas[ref.collection];
			validated[id] = schema && schema instanceof Schema ? schema.validate(data) : data;
		} catch (thrown) {
			if (isFeedback(thrown)) invalids[id] = thrown;
			else throw thrown;
			invalid = true;
		}
	}
	if (invalid) throw new ValidationError(`Invalid documents for "${ref.path}"`, new InvalidFeedback("Invalid documents", invalids));
	return validated;
}
