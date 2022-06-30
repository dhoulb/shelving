import type { Data, Entities, OptionalEntity } from "../util/data.js";
import type { DocumentReference, QueryReference } from "../db/Reference.js";
import type { DataUpdate } from "../update/DataUpdate.js";
import type { Class } from "../util/class.js";
import type { PartialObserver } from "../observe/Observer.js";
import type { Unsubscribe } from "../observe/Observable.js";
import { AssertionError } from "../error/AssertionError.js";
import { AsynchronousProvider, Provider, SynchronousProvider } from "./Provider.js";

/**
 * Pass all reads and writes through to a source provider.
 */
export class ThroughProvider extends Provider {
	readonly source: Provider;
	constructor(source: Provider) {
		super();
		this.source = source;
	}
	getDocument<T extends Data>(ref: DocumentReference<T>): OptionalEntity<T> | PromiseLike<OptionalEntity<T>> {
		return this.source.getDocument(ref);
	}
	subscribeDocument<T extends Data>(ref: DocumentReference<T>, observer: PartialObserver<OptionalEntity<T>>): Unsubscribe {
		return this.source.subscribeDocument(ref, observer);
	}
	addDocument<T extends Data>(ref: QueryReference<T>, data: T): string | PromiseLike<string> {
		return this.source.addDocument(ref, data);
	}
	setDocument<T extends Data>(ref: DocumentReference<T>, data: T): void | PromiseLike<void> {
		return this.source.setDocument(ref, data);
	}
	updateDocument<T extends Data>(ref: DocumentReference<T>, update: DataUpdate<T>): void | PromiseLike<void> {
		return this.source.updateDocument(ref, update);
	}
	deleteDocument<T extends Data>(ref: DocumentReference<T>): void | PromiseLike<void> {
		return this.source.deleteDocument(ref);
	}
	getQuery<T extends Data>(ref: QueryReference<T>): Entities<T> | PromiseLike<Entities<T>> {
		return this.source.getQuery(ref);
	}
	subscribeQuery<T extends Data>(ref: QueryReference<T>, observer: PartialObserver<Entities<T>>): Unsubscribe {
		return this.source.subscribeQuery(ref, observer);
	}
	setQuery<T extends Data>(ref: QueryReference<T>, data: T): number | PromiseLike<number> {
		return this.source.setQuery(ref, data);
	}
	updateQuery<T extends Data>(ref: QueryReference<T>, update: DataUpdate<T>): number | PromiseLike<number> {
		return this.source.updateQuery(ref, update);
	}
	deleteQuery<T extends Data>(ref: QueryReference<T>): number | PromiseLike<number> {
		return this.source.deleteQuery(ref);
	}
}

/** Synchronous through provider must have synchronous source provider. */
export interface SynchronousThroughProvider extends SynchronousProvider {
	new (source: SynchronousProvider): SynchronousProvider;
}

/** Asynchronous through provider must have asynchronous source provider. */
export interface AsynchronousThroughProvider extends AsynchronousProvider {
	new (source: AsynchronousProvider): AsynchronousProvider;
}

/** Find a specific source provider in a database's provider stack. */
export function findSourceProvider<P extends Provider>(provider: Provider, type: Class<P>): P {
	if (provider instanceof type) return provider as P;
	if (provider instanceof ThroughProvider) return findSourceProvider(provider.source, type);
	throw new AssertionError(`Source provider ${type.name} not found`, provider);
}
