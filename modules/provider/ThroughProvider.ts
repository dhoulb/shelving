import type { Result, Entries, Unsubscriber, Observer, Class, Data } from "../util/index.js";
import type { DatabaseDocument, DatabaseQuery } from "../db/index.js";
import type { DataUpdate } from "../update/index.js";
import { AssertionError } from "../error/index.js";
import { Provider } from "./Provider.js";

/**
 * Pass all reads and writes through to a source provider.
 */
export class ThroughProvider extends Provider {
	readonly source: Provider;
	constructor(source: Provider) {
		super();
		this.source = source;
	}
	get<T extends Data>(ref: DatabaseDocument<T>): Result<T> | PromiseLike<Result<T>> {
		return this.source.get(ref);
	}
	subscribe<T extends Data>(ref: DatabaseDocument<T>, observer: Observer<Result<T>>): Unsubscriber {
		return this.source.subscribe(ref, observer);
	}
	add<T extends Data>(ref: DatabaseQuery<T>, data: T): string | PromiseLike<string> {
		return this.source.add(ref, data);
	}
	set<T extends Data>(ref: DatabaseDocument<T>, data: T): void | PromiseLike<void> {
		return this.source.set(ref, data);
	}
	update<T extends Data>(ref: DatabaseDocument<T>, update: DataUpdate<T>): void | PromiseLike<void> {
		return this.source.update(ref, update);
	}
	delete<T extends Data>(ref: DatabaseDocument<T>): void | PromiseLike<void> {
		return this.source.delete(ref);
	}
	getQuery<T extends Data>(ref: DatabaseQuery<T>): Entries<T> | PromiseLike<Entries<T>> {
		return this.source.getQuery(ref);
	}
	subscribeQuery<T extends Data>(ref: DatabaseQuery<T>, observer: Observer<Entries<T>>): Unsubscriber {
		return this.source.subscribeQuery(ref, observer);
	}
	setQuery<T extends Data>(ref: DatabaseQuery<T>, data: T): number | PromiseLike<number> {
		return this.source.setQuery(ref, data);
	}
	updateQuery<T extends Data>(ref: DatabaseQuery<T>, update: DataUpdate<T>): number | PromiseLike<number> {
		return this.source.updateQuery(ref, update);
	}
	deleteQuery<T extends Data>(ref: DatabaseQuery<T>): number | PromiseLike<number> {
		return this.source.deleteQuery(ref);
	}
}

/** Find a specific source provider in a database's provider stack. */
export function findSourceProvider<P extends Provider>(provider: Provider, type: Class<P>): P {
	if (provider instanceof type) return provider as P;
	if (provider instanceof ThroughProvider) return findSourceProvider(provider.source, type);
	throw new AssertionError(`Source provider ${type.name} not found`, provider);
}
