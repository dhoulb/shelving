import { Data, Result, Results, Unsubscriber, Observer, Transforms } from "../util";
import type { Document } from "./Document";
import type { Documents } from "./Documents";
import type { Provider } from "./Provider";
import { DocumentsState } from "./DocumentsState";
import { DocumentState } from "./DocumentState";

/**
 * State provider: keeps track of, and provides access to, the most recent value for a source provider.
 */
export class StateProvider implements Provider {
	readonly #source: Provider;
	constructor(source: Provider) {
		this.#source = source;
	}
	getDocument<X extends Data>(ref: Document<X>): Result<X> | Promise<Result<X>> {
		const result = this.#source.getDocument(ref);
		DocumentState.set(ref, result);
		return result;
	}
	onDocument<X extends Data>(ref: Document<X>, observer: Observer<Result<X>>): Unsubscriber {
		return observer instanceof DocumentState ? this.#source.onDocument(ref, observer) : DocumentState.start(ref, observer);
	}
	async addDocument<X extends Data>(ref: Documents<X>, data: X): Promise<string> {
		const id = await this.#source.addDocument(ref, data);
		DocumentState.set(ref.doc(id), data);
		return id;
	}
	async setDocument<X extends Data>(ref: Document<X>, data: X): Promise<void> {
		await this.#source.setDocument(ref, data);
		DocumentState.set(ref, data);
	}
	async updateDocument<X extends Data>(ref: Document<X>, transforms: Transforms<X>): Promise<void> {
		await this.#source.updateDocument(ref, transforms);
		DocumentState.update(ref, transforms);
	}
	async deleteDocument<X extends Data>(ref: Document<X>): Promise<void> {
		await this.#source.deleteDocument(ref);
		DocumentState.set(ref, undefined);
	}
	getDocuments<X extends Data>(ref: Documents<X>): Results<X> | Promise<Results<X>> {
		const results = this.#source.getDocuments(ref);
		DocumentsState.set(ref, results);
		return results;
	}
	onDocuments<X extends Data>(ref: Documents<X>, observer: Observer<Results<X>>): Unsubscriber {
		return observer instanceof DocumentState ? this.#source.onDocuments(ref, observer) : DocumentsState.start(ref, observer);
	}
	setDocuments<X extends Data>(ref: Documents<X>, data: X): void | Promise<void> {
		return this.#source.setDocuments(ref, data);
	}
	updateDocuments<X extends Data>(ref: Documents<X>, data: Partial<X>): void | Promise<void> {
		return this.#source.updateDocuments(ref, data);
	}
	deleteDocuments<X extends Data>(ref: Documents<X>): void | Promise<void> {
		return this.#source.deleteDocuments(ref);
	}
}
