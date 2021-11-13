import type { Data, Result, Results, Unsubscriber, Observer, Transforms, Class } from "../util/index.js";
import type { ModelDocument, ModelQuery } from "../db/index.js";
import type { Provider } from "./Provider.js";

/**
 * Pass all reads and writes through to a source provider.
 */
export class ThroughProvider implements Provider {
	readonly source: Provider;
	constructor(source: Provider) {
		this.source = source;
	}
	get<X extends Data>(ref: ModelDocument<X>): Result<X> | Promise<Result<X>> {
		return this.source.get(ref);
	}
	subscribe<X extends Data>(ref: ModelDocument<X>, observer: Observer<Result<X>>): Unsubscriber {
		return this.source.subscribe(ref, observer);
	}
	add<X extends Data>(ref: ModelQuery<X>, data: X): string | Promise<string> {
		return this.source.add(ref, data);
	}
	set<X extends Data>(ref: ModelDocument<X>, data: X): void | Promise<void> {
		return this.source.set(ref, data);
	}
	update<X extends Data>(ref: ModelDocument<X>, transforms: Transforms<X>): void | Promise<void> {
		return this.source.update(ref, transforms);
	}
	delete<X extends Data>(ref: ModelDocument<X>): void | Promise<void> {
		return this.source.delete(ref);
	}
	getQuery<X extends Data>(ref: ModelQuery<X>): Results<X> | Promise<Results<X>> {
		return this.source.getQuery(ref);
	}
	subscribeQuery<X extends Data>(ref: ModelQuery<X>, observer: Observer<Results<X>>): Unsubscriber {
		return this.source.subscribeQuery(ref, observer);
	}
	setQuery<X extends Data>(ref: ModelQuery<X>, data: X): void | Promise<void> {
		return this.source.setQuery(ref, data);
	}
	updateQuery<X extends Data>(ref: ModelQuery<X>, transforms: Transforms<X>): void | Promise<void> {
		return this.source.updateQuery(ref, transforms);
	}
	deleteQuery<X extends Data>(ref: ModelQuery<X>): void | Promise<void> {
		return this.source.deleteQuery(ref);
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
