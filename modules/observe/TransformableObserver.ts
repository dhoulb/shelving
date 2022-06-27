import type { Transformable } from "../util/transform.js";
import { AbstractObserver } from "./AbstractObserver.js";
import { dispatchNext } from "./Observer.js";

/** Observer implementing `Transformable` that implements a `transform()` property that is called to transform the next value before dispatching it. */
export abstract class TransformableObserver<I, O> extends AbstractObserver<I, O> implements Transformable<I, O> {
	next(value: I) {
		dispatchNext(this.target, this.transform(value));
	}
	abstract transform(input: I): O;
}
