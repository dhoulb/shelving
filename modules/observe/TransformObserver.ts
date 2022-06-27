import { transform, Transformer } from "../util/transform.js";
import type { PartialObserver } from "./Observer.js";
import { TransformableObserver } from "./TransformableObserver.js";

/** Observer that transforms its next values with a transformer. */
export class TransformObserver<I, O> extends TransformableObserver<I, O> {
	protected _transformer: Transformer<I, O>;
	constructor(transformer: Transformer<I, O>, target: PartialObserver<O>) {
		super(target);
		this._transformer = transformer;
	}
	transform(value: I): O {
		return transform(value, this._transformer);
	}
}
