import { AbstractObserver } from "./AbstractObserver.js";
import { dispatchAsyncNext } from "./Observer.js";

/** Observer that allows promised values to be passed to `next()`. */
export class AsyncObserver<T> extends AbstractObserver<PromiseLike<T>, T> {
	next(value: PromiseLike<T>) {
		dispatchAsyncNext(this.target, value);
	}
}
