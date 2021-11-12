import type { Data, Result, Results, Unsubscriber, Observer, Transforms, Class } from "../util/index.js";
import type { Document, Documents } from "./Reference.js";
import type { Provider } from "./Provider.js";

/**
 * Pass all reads and writes through to a source provider.
 */
export class ThroughProvider implements Provider {
	readonly source: Provider;
	constructor(source: Provider) {
		this.source = source;
	}
	getDocument<X extends Data>(ref: Document<X>): Result<X> | Promise<Result<X>> {
		return this.source.getDocument(ref);
	}
	onDocument<X extends Data>(ref: Document<X>, observer: Observer<Result<X>>): Unsubscriber {
		return this.source.onDocument(ref, observer);
	}
	addDocument<X extends Data>(ref: Documents<X>, data: X): string | Promise<string> {
		return this.source.addDocument(ref, data);
	}
	setDocument<X extends Data>(ref: Document<X>, data: X): void | Promise<void> {
		return this.source.setDocument(ref, data);
	}
	updateDocument<X extends Data>(ref: Document<X>, transforms: Transforms<X>): void | Promise<void> {
		return this.source.updateDocument(ref, transforms);
	}
	deleteDocument<X extends Data>(ref: Document<X>): void | Promise<void> {
		return this.source.deleteDocument(ref);
	}
	getDocuments<X extends Data>(ref: Documents<X>): Results<X> | Promise<Results<X>> {
		return this.source.getDocuments(ref);
	}
	onDocuments<X extends Data>(ref: Documents<X>, observer: Observer<Results<X>>): Unsubscriber {
		return this.source.onDocuments(ref, observer);
	}
	setDocuments<X extends Data>(ref: Documents<X>, data: X): void | Promise<void> {
		return this.source.setDocuments(ref, data);
	}
	updateDocuments<X extends Data>(ref: Documents<X>, transforms: Transforms<X>): void | Promise<void> {
		return this.source.updateDocuments(ref, transforms);
	}
	deleteDocuments<X extends Data>(ref: Documents<X>): void | Promise<void> {
		return this.source.deleteDocuments(ref);
	}
}

/** Find a specific source provider in a database's provider stack. */
export function findSourceProvider<X extends Provider>(provider: Provider, type: Class<X>): X {
	while (provider) {
		if (provider instanceof type) return provider as X;
		if (provider instanceof ThroughProvider) provider = provider.source; // eslint-disable-line no-param-reassign
		break;
	}
	throw new Error(`${type.name} not found`);
}
