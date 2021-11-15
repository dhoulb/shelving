import type { Data, Result, Results, Unsubscriber, Observer, Class, Transformer } from "../util/index.js";
import type { ModelDocument, ModelQuery } from "../db/index.js";
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
	get<T extends Data>(ref: ModelDocument<T>): Result<T> | Promise<Result<T>> {
		return this.source.get(ref);
	}
	subscribe<T extends Data>(ref: ModelDocument<T>, observer: Observer<Result<T>>): Unsubscriber {
		return this.source.subscribe(ref, observer);
	}
	add<T extends Data>(ref: ModelQuery<T>, data: T): string | Promise<string> {
		return this.source.add(ref, data);
	}
	write<T extends Data>(ref: ModelDocument<T>, value: T | Transformer<T> | undefined): void | Promise<void> {
		return this.source.write(ref, value);
	}
	getQuery<T extends Data>(ref: ModelQuery<T>): Results<T> | Promise<Results<T>> {
		return this.source.getQuery(ref);
	}
	subscribeQuery<T extends Data>(ref: ModelQuery<T>, observer: Observer<Results<T>>): Unsubscriber {
		return this.source.subscribeQuery(ref, observer);
	}
	writeQuery<T extends Data>(ref: ModelQuery<T>, value: T | Transformer<T> | undefined): void | Promise<void> {
		return this.source.writeQuery(ref, value);
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
