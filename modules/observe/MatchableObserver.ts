import { Matchable } from "../util/match.js";
import { AbstractObserver } from "./AbstractObserver.js";
import { dispatchNext } from "./Observer.js";

/** Observer implementing `Matchable` that implements a `match()` property that is called filter the next value before dispatching it. */
export abstract class MatchableObserver<T> extends AbstractObserver<T, T> implements Matchable<T, void> {
	next(value: T) {
		const target = this.target;
		if (this.match(value)) dispatchNext(target, value);
	}
	abstract match(value: T): boolean;
}
