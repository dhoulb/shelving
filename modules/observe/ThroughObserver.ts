import { AbstractObserver } from "./AbstractObserver.js";
import { dispatchNext } from "./Observer.js";

/** Observer that unsubscribes.*/
export class ThroughObserver<T> extends AbstractObserver<T, T> {
	next(value: T): void {
		dispatchNext(this.target, value);
	}
}
