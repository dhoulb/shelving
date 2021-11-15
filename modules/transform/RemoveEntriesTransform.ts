import { ImmutableArray, ImmutableObject, isObject, withoutEntries } from "../util/index.js";
import { Transform } from "./Transform.js";

/** Remove props transform: an object that removes a specific set of named props from a map-like object. */
export class RemoveEntriesTransform<T> extends Transform<ImmutableObject<T>> {
	readonly props: ImmutableArray<string>;
	constructor(...props: ImmutableArray<string>) {
		super();
		this.props = props;
	}
	transform(existing?: unknown): ImmutableObject<T> {
		return isObject<ImmutableObject<T>>(existing) ? withoutEntries(existing, this.props) : {};
	}

	// Implement iterator protocol.
	*[Symbol.iterator](): Generator<string, void, undefined> {
		yield* this.props;
	}
}
