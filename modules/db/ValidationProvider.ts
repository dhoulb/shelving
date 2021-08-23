import { Data, Result, Results, Unsubscriber, MutableObject, Observer, isAsync, assertInstance } from "../util";
import { Feedback, InvalidFeedback, isFeedback } from "../feedback";
import { ObjectSchema } from "../schema";
import { Stream } from "../stream";
import type { Provider } from "./Provider";
import type { Document } from "./Document";
import type { Documents } from "./Documents";
import { ReferenceValidationError } from "./errors";

/**
 * Validation provider: validates any values that are read from or written a the source provider.
 */
export class ValidationProvider implements Provider {
	readonly #source: Provider;
	constructor(source: Provider) {
		this.#source = source;
	}
	getDocument<X extends Data>(ref: Document<X>): Result<X> | Promise<Result<X>> {
		const result = this.#source.getDocument(ref);
		if (isAsync(result)) return this.#awaitGetDocument(ref, result);
		return result ? ref.validate(result) : undefined;
	}
	async #awaitGetDocument<X extends Data>(ref: Document<X>, asyncResult: Promise<Result<X>>): Promise<Result<X>> {
		const result = await asyncResult;
		return result ? ref.validate(result) : undefined;
	}
	onDocument<X extends Data>(ref: Document<X>, observer: Observer<Result>): Unsubscriber {
		const stream = Stream.derive<Result<X>, Result<X>>(v => (v ? ref.validate(v) : undefined));
		stream.subscribe(observer);
		return this.#source.onDocument(ref, stream);
	}
	addDocument<X extends Data>(ref: Documents<X>, data: X): string | Promise<string> {
		return this.#source.addDocument(ref, ref.validate(data));
	}
	setDocument<X extends Data>(ref: Document<X>, data: X): void | Promise<void> {
		return this.#source.setDocument(ref, ref.validate(data));
	}
	updateDocument<X extends Data>(ref: Document<X>, data: Partial<X>): void | Promise<void> {
		return this.#source.updateDocument(ref, ref.validate(data, true));
	}
	deleteDocument<X extends Data>(ref: Document<X>): void | Promise<void> {
		return this.#source.deleteDocument(ref);
	}
	getDocuments<X extends Data>(ref: Documents<X>): Results<X> | Promise<Results<X>> {
		const results = this.#source.getDocuments(ref);
		if (isAsync(results)) return this.#awaitGetDocuments(ref, results);
		return validateResults<X>(ref, results);
	}
	async #awaitGetDocuments<X extends Data>(ref: Documents<X>, asyncResult: Promise<Results<X>>): Promise<Results<X>> {
		return validateResults<X>(ref, await asyncResult);
	}
	onDocuments<X extends Data>(ref: Documents<X>, observer: Observer<Results<X>>): Unsubscriber {
		const stream = Stream.derive<Results<X>, Results<X>>(v => validateResults(ref, v));
		stream.subscribe(observer);
		return this.#source.onDocuments(ref, stream);
	}
	setDocuments<X extends Data>(ref: Documents<X>, data: X): void | Promise<void> {
		return this.#source.setDocuments(ref, ref.validate(data));
	}
	updateDocuments<X extends Data>(ref: Documents<X>, data: Partial<X>): void | Promise<void> {
		return this.#source.updateDocuments(ref, ref.validate(data, true));
	}
	deleteDocuments<X extends Data>(ref: Documents<X>): void | Promise<void> {
		return this.#source.deleteDocuments(ref);
	}
}

/** Validate a set of documents at this path. */
function validateResults<X extends Data>(ref: Documents<X>, results: Results<X>): Results<X> {
	const validated: MutableObject<X> = {};
	const invalids: MutableObject<Feedback> = {};
	let invalid = false;
	for (const [id, data] of Object.entries(results)) {
		try {
			const schema = ref.db.schemas[ref.collection];
			assertInstance<ObjectSchema<X>>(schema, ObjectSchema);
			validated[id] = schema.validate(data);
		} catch (thrown) {
			if (isFeedback(thrown)) {
				invalids[id] = thrown;
				invalid = true;
			} else throw thrown;
		}
	}
	if (invalid) throw new ReferenceValidationError(ref, new InvalidFeedback("Invalid documents", invalids));
	return validated;
}
