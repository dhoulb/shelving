import type { Transformer } from "../util/transform.js";
import { Subscribable, subscribe, Unsubscribe } from "./Observable.js";
import { TransformObserver } from "./TransformObserver.js";
import { AsyncObserver } from "./AsyncObserver.js";
import { OnceObserver } from "./OnceObserver.js";
import { ThroughObserver } from "./ThroughObserver.js";
import { ConnectableObserver } from "./Observer.js";

/** Get a promise that resolves to the next value of a source subscribable. */
export function awaitNext<T>(source: Subscribable<T>): Promise<T> {
	return new Promise((next, error) => new OnceObserver<T>({ next, error }).connect(source));
}

/** Get a promise that resolves when a source subscribable is complete. */
export function awaitComplete<T>(source: Subscribable<T>): Promise<void> {
	return new Promise((complete, error) => new ThroughObserver<T>({ complete, error }).connect(source));
}

/** Connect a connectable to a source subscribable but transform the value using a transform. */
export function connectDerived<T, TT>(source: Subscribable<T>, transform: Transformer<T, TT>, target: ConnectableObserver<TT>): Unsubscribe {
	return target.connect(() => subscribe(source, new TransformObserver<T, TT>(transform, target)));
}

/** Connect a connectable to a source subscribable but transform the value using an async transform. */
export function connectAsyncDerived<T, TT>(source: Subscribable<T>, transformer: Transformer<T, PromiseLike<TT>>, target: ConnectableObserver<TT>): Unsubscribe {
	return target.connect(() => subscribe(source, new TransformObserver(transformer, new AsyncObserver(target))));
}
