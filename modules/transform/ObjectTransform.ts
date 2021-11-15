import { assertObject, ImmutableObject, PropEntry, transformProps, Transformers } from "../util/index.js";
import { Transform } from "./Transform.js";

/** Set of transforms that can be appled to an object's properties. */
export class ObjectTransform<T extends ImmutableObject> extends Transform<T> {
	readonly props: Transformers<T>;
	constructor(props: Transformers<T>) {
		super();
		this.props = props;
	}
	transform(existing?: unknown): T {
		assertObject<T>(existing);
		return transformProps(existing, this.props);
	}

	// Implement iterator protocol.
	*[Symbol.iterator](): Generator<PropEntry<Transformers<T>>, void, undefined> {
		yield* Object.entries(this.props);
	}
}
