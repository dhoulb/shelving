import type { Result, Results, Unsubscriber, Observer, Class, Datas, Key } from "../util/index.js";
import type { DatabaseDocument, DatabaseQuery } from "../db/index.js";
import type { Transform } from "../transform/index.js";
import { AssertionError } from "../error/index.js";
import { Provider } from "./Provider.js";

/**
 * Pass all reads and writes through to a source provider.
 */
export class ThroughProvider<D extends Datas> extends Provider<D> {
	readonly source: Provider<D>;
	constructor(source: Provider<D>) {
		super();
		this.source = source;
	}
	get<C extends Key<D>>(ref: DatabaseDocument<C, D>): Result<D[C]> | PromiseLike<Result<D[C]>> {
		return this.source.get(ref);
	}
	subscribe<C extends Key<D>>(ref: DatabaseDocument<C, D>, observer: Observer<Result<D[C]>>): Unsubscriber {
		return this.source.subscribe(ref, observer);
	}
	add<C extends Key<D>>(ref: DatabaseQuery<C, D>, data: D[C]): string | PromiseLike<string> {
		return this.source.add(ref, data);
	}
	write<C extends Key<D>>(ref: DatabaseDocument<C, D>, value: D[C] | Transform<D[C]> | undefined): void | PromiseLike<void> {
		return this.source.write(ref, value);
	}
	getQuery<C extends Key<D>>(ref: DatabaseQuery<C, D>): Results<D[C]> | PromiseLike<Results<D[C]>> {
		return this.source.getQuery(ref);
	}
	subscribeQuery<C extends Key<D>>(ref: DatabaseQuery<C, D>, observer: Observer<Results<D[C]>>): Unsubscriber {
		return this.source.subscribeQuery(ref, observer);
	}
	writeQuery<C extends Key<D>>(ref: DatabaseQuery<C, D>, value: D[C] | Transform<D[C]> | undefined): void | PromiseLike<void> {
		return this.source.writeQuery(ref, value);
	}
}

/** Find a specific source provider in a database's provider stack. */
export function findSourceProvider<D extends Datas, P extends Provider<D>>(provider: Provider<D>, type: Class<P>): P {
	if (provider instanceof type) return provider as P;
	if (provider instanceof ThroughProvider) return findSourceProvider(provider.source, type);
	throw new AssertionError(`Source provider ${type.name} not found`, provider);
}
