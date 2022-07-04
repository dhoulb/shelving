import type { Transformer } from "../util/transform.js";
import { Unsubscribe, Subscribable, subscribe } from "./Observable.js";
import { TransformObserver } from "./TransformObserver.js";
import { AsyncObserver } from "./AsyncObserver.js";
import { OnceObserver } from "./OnceObserver.js";
import { ThroughObserver } from "./ThroughObserver.js";
import { ConnectableObserver } from "./Observer.js";
import { Subject } from "./Subject.js";

/** Get a promise that resolves to the next value of a source subscribable. */
export function awaitNext<T>(source: Subscribable<T>): Promise<T> {
	return new Promise((next, error) => new OnceObserver<T>({ next, error }).connect(source));
}

/** Get a promise that resolves when a source subscribable is complete. */
export function awaitComplete<T>(source: Subscribable<T>): Promise<void> {
	return new Promise((complete, error) => new ThroughObserver<T>({ complete, error }).connect(source));
}

/** Connect a connectable to a source subscribable but transform the value using a transform. */
export function connectDerived<T, TT>(source: Subscribable<T>, transformer: Transformer<T, TT>, target: ConnectableObserver<TT>): Unsubscribe {
	return target.connect(() => subscribe(source, new TransformObserver<T, TT>(transformer, target)));
}

/** Connect a connectable to a source subscribable but transform the value using an async transform. */
export function connectAsyncDerived<T, TT>(source: Subscribable<T>, transformer: Transformer<T, PromiseLike<TT>>, target: ConnectableObserver<TT>): Unsubscribe {
	return target.connect(() => subscribe(source, new TransformObserver(transformer, new AsyncObserver(target))));
}

/** Connect a connectable to a source subscribable, and return the connected connectable. */
export function connected<T, C extends ConnectableObserver<T>>(source: Subscribable<T>, target: C): C;
export function connected<T>(source: Subscribable<T>, target: ConnectableObserver<T>): Subject<T>;
export function connected<T>(source: Subscribable<T>): Subject<T>;
export function connected<T>(source: Subscribable<T>, target: ConnectableObserver<T> = new Subject<T>()): ConnectableObserver<T> {
	target.connect(source);
	return target;
}

/** Connect a connectable to a source subscribable but transform the value using a transform, and return the connected connectable. */
export function connectedDerived<T, TT, C extends ConnectableObserver<TT>>(source: Subscribable<T>, transformer: Transformer<T, TT>, target: C): C;
export function connectedDerived<T, TT>(source: Subscribable<T>, transformer: Transformer<T, TT>, target: ConnectableObserver<TT>): ConnectableObserver<TT>;
export function connectedDerived<T, TT>(source: Subscribable<T>, transformer: Transformer<T, TT>): Subject<TT>;
export function connectedDerived<T, TT>(source: Subscribable<T>, transformer: Transformer<T, TT>, target: ConnectableObserver<TT> = new Subject<TT>()): ConnectableObserver<TT> {
	connectDerived(source, transformer, target);
	return target;
}

/** Connect a connectable to a source subscribable but transform the value using an async transform, and return the connected connectable. */
export function connectedAsyncDerived<T, TT, C extends ConnectableObserver<TT>>(source: Subscribable<T>, transformer: Transformer<T, PromiseLike<TT>>, target: C): C;
export function connectedAsyncDerived<T, TT>(source: Subscribable<T>, transformer: Transformer<T, PromiseLike<TT>>, target: ConnectableObserver<TT>): ConnectableObserver<TT>;
export function connectedAsyncDerived<T, TT>(source: Subscribable<T>, transformer: Transformer<T, PromiseLike<TT>>): Subject<TT>;
export function connectedAsyncDerived<T, TT>(source: Subscribable<T>, transformer: Transformer<T, PromiseLike<TT>>, target: ConnectableObserver<TT> = new Subject<TT>()): ConnectableObserver<TT> {
	connectAsyncDerived(source, transformer, target);
	return target;
}
