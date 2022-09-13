import type { Entry } from "../util/entry.js";
import { ImmutableObject, withoutObjectProps } from "../util/object.js";
import { transformData, Transformers } from "../util/transform.js";
import { State } from "./State.js";

/** State that stores a map-like object and has additional methods to help with that. */
export class ObjectState<T> extends State<ImmutableObject<T>> implements Iterable<Entry<string, T>> {
	constructor(initial: ImmutableObject<T> = {}) {
		super(initial);
	}

	/** Get the length of the current value of this state. */
	get count(): number {
		return Object.keys(this.value).length;
	}

	/** Set a named entry in this object with a different value. */
	update(updates: Transformers<ImmutableObject<T>>): void {
		this.set(transformData(this.value, updates));
	}

	/** Remove a named entry from this object. */
	delete(...keys: string[]): void {
		this.set(withoutObjectProps(this.value, ...keys));
	}

	/** Iterate over the entries of the object. */
	[Symbol.iterator](): Iterator<Entry<string, T>> {
		return Object.entries<T>(this.value)[Symbol.iterator]();
	}
}
