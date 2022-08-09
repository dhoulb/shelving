import type { Datas, Entities, Key, OptionalEntity } from "../util/data.js";
import type { DataUpdate } from "../update/DataUpdate.js";
import type { Class } from "../util/class.js";
import type { PartialObserver } from "../observe/Observer.js";
import type { Unsubscribe } from "../observe/Observable.js";
import { AssertionError } from "../error/AssertionError.js";
import { AsyncProvider, AbstractProvider, ProviderCollection, ProviderDocument, ProviderQuery, Provider } from "./Provider.js";

/** A provider that passes through to a source. */
export abstract class AbstractThroughProvider<T extends Datas> extends AbstractProvider<T> {
	readonly source: AbstractProvider<T>;
	constructor(source: AbstractProvider<T>) {
		super();
		this.source = source;
	}
}

/** A provider that passes through to a synchronous source. */
export class ThroughProvider<T extends Datas> implements AbstractThroughProvider<T>, Provider<T> {
	readonly source: Provider<T>;
	constructor(source: Provider<T>) {
		this.source = source;
	}
	getDocument<K extends Key<T>>(ref: ProviderDocument<T, K>): OptionalEntity<T[K]> {
		return this.source.getDocument(ref);
	}
	subscribeDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, observer: PartialObserver<OptionalEntity<T[K]>>): Unsubscribe {
		return this.source.subscribeDocument(ref, observer);
	}
	addDocument<K extends Key<T>>(ref: ProviderCollection<T, K>, data: T[K]): string {
		return this.source.addDocument(ref, data);
	}
	setDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, data: T[K]): void {
		return this.source.setDocument(ref, data);
	}
	updateDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, update: DataUpdate<T[K]>): void {
		return this.source.updateDocument(ref, update);
	}
	deleteDocument<K extends Key<T>>(ref: ProviderDocument<T, K>): void {
		return this.source.deleteDocument(ref);
	}
	getQuery<K extends Key<T>>(ref: ProviderQuery<T, K>): Entities<T[K]> {
		return this.source.getQuery(ref);
	}
	subscribeQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, observer: PartialObserver<Entities<T[K]>>): Unsubscribe {
		return this.source.subscribeQuery(ref, observer);
	}
	setQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, data: T[K]): number {
		return this.source.setQuery(ref, data);
	}
	updateQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, update: DataUpdate<T[K]>): number {
		return this.source.updateQuery(ref, update);
	}
	deleteQuery<K extends Key<T>>(ref: ProviderQuery<T, K>): number {
		return this.source.deleteQuery(ref);
	}
}

/** A provider that passes through to an asynchronous source. */
export class AsyncThroughProvider<T extends Datas> implements AbstractThroughProvider<T>, AsyncProvider<T> {
	readonly source: AsyncProvider<T>;
	constructor(source: AsyncProvider<T>) {
		this.source = source;
	}
	getDocument<K extends Key<T>>(ref: ProviderDocument<T, K>): Promise<OptionalEntity<T[K]>> {
		return this.source.getDocument(ref);
	}
	subscribeDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, observer: PartialObserver<OptionalEntity<T[K]>>): Unsubscribe {
		return this.source.subscribeDocument(ref, observer);
	}
	addDocument<K extends Key<T>>(ref: ProviderCollection<T, K>, data: T[K]): Promise<string> {
		return this.source.addDocument(ref, data);
	}
	setDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, data: T[K]): Promise<void> {
		return this.source.setDocument(ref, data);
	}
	updateDocument<K extends Key<T>>(ref: ProviderDocument<T, K>, update: DataUpdate<T[K]>): Promise<void> {
		return this.source.updateDocument(ref, update);
	}
	deleteDocument<K extends Key<T>>(ref: ProviderDocument<T, K>): Promise<void> {
		return this.source.deleteDocument(ref);
	}
	getQuery<K extends Key<T>>(ref: ProviderQuery<T, K>): Promise<Entities<T[K]>> {
		return this.source.getQuery(ref);
	}
	subscribeQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, observer: PartialObserver<Entities<T[K]>>): Unsubscribe {
		return this.source.subscribeQuery(ref, observer);
	}
	setQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, data: T[K]): Promise<number> {
		return this.source.setQuery(ref, data);
	}
	updateQuery<K extends Key<T>>(ref: ProviderQuery<T, K>, update: DataUpdate<T[K]>): Promise<number> {
		return this.source.updateQuery(ref, update);
	}
	deleteQuery<K extends Key<T>>(ref: ProviderQuery<T, K>): Promise<number> {
		return this.source.deleteQuery(ref);
	}
}

/** Find a possible source provider in a database's provider stack (if it exists). */
export function getOptionalSourceProvider<T extends Datas, P extends AbstractProvider<T>>(provider: AbstractThroughProvider<T> | AbstractProvider<T>, type: Class<P>): P | undefined {
	if (provider instanceof type) return provider as P;
	if ("source" in provider) return getSourceProvider(provider.source, type);
}

/** Find a source provider in a database's provider stack. */
export function getSourceProvider<T extends Datas, P extends AbstractProvider<T>>(provider: AbstractThroughProvider<T> | AbstractProvider<T>, type: Class<P>): P {
	const source = getOptionalSourceProvider(provider, type);
	if (!source) throw new AssertionError(`Source provider ${type.name} not found`, provider);
	return source;
}
