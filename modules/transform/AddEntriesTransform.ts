import { Entry, ImmutableObject, isObject, withEntries } from "../util/index.js";
import { Transform } from "./Transform.js";

/** Add entries transform: an object that adds a set of naemd props to a map-like object. */
export class AddEntriesTransform<T> extends Transform<ImmutableObject<T>> {
	readonly props: ImmutableObject<T>;
	constructor(props: ImmutableObject<T>) {
		super();
		this.props = props;
	}
	transform(existing?: unknown): ImmutableObject<T> {
		return isObject<ImmutableObject<T>>(existing) ? withEntries(existing, this.props) : {};
	}

	// Implement iterator protocol.
	*[Symbol.iterator](): Generator<Entry<T>, void, undefined> {
		yield* Object.entries(this.props);
	}
}
