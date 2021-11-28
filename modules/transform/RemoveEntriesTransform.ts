import { ImmutableArray, ImmutableObject, isObject, withoutEntries } from "../util/index.js";
import { Transform } from "./Transform.js";

/** Remove props transform: an object that removes a specific set of named props from a map-like object. */
export class RemoveEntriesTransform<T> extends Transform<ImmutableObject<T>> implements Iterable<string> {
	readonly props: ImmutableArray<string>;
	constructor(...props: ImmutableArray<string>) {
		super();
		this.props = props;
	}
	derive(existing?: unknown): ImmutableObject<T> {
		return isObject<ImmutableObject<T>>(existing) ? withoutEntries(existing, this.props) : {};
	}

	/** Iterate over the entry keys. */
	[Symbol.iterator](): Iterator<string, void> {
		return this.props.values();
	}
}
