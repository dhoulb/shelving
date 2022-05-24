import type { Entry } from "../util/entry.js";
import { ImmutableObject, withEntry, withoutEntry } from "../util/object.js";
import { State } from "./State.js";

/** State that stores a map-like object and has additional methods to help with that. */
export class ObjectState<T> extends State<ImmutableObject<T>> implements Iterable<Entry<T>> {
	// Set default value to be empty object.
	override _value = {};

	/** Get the length of the current value of this state. */
	get length(): number {
		return Object.keys(this._value).length;
	}

	/** Remove a named entry from this object. */
	delete(key: string): void {
		this.next(withoutEntry(this._value, key));
	}

	/** Set a named entry in this object with a different value. */
	set(key: string, value: T): void {
		this.next(withEntry(this._value, key, value));
	}

	/** Iterate over the items. */
	[Symbol.iterator](): Iterator<Entry<T>, void> {
		return Object.entries<T>(this._value)[Symbol.iterator]();
	}
}
