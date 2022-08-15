import { Data, getData, Key, OptionalData, withProp } from "../util/data.js";
import { Transformers, transformData } from "../util/transform.js";
import { State } from "./State.js";

/** State that stores a data object and has additional methods to help with that. */
export class DataState<T extends Data> extends State<T> {
	/** Get the data value of this state. */
	get data(): T {
		return this.value;
	}

	/** Set a prop in this object to a new value. */
	set<K extends Key<T>>(key: K, value: T[K]): void {
		this.next(withProp(this.data, key, value));
	}

	/** Update several props in this object. */
	update(updates: Transformers<T>): void {
		this.next(transformData(this.data, updates));
	}
}

/** State that stores an optional data object and has additional methods to help with that. */
export class OptionalDataState<T extends Data> extends State<OptionalData<T>> {
	/** Get current data value of this state (or throw `Promise` that resolves to the next required value). */
	get data(): T {
		return getData(this.value);
	}

	/** Does the data exist or not? */
	get exists(): boolean {
		return !!this.value;
	}

	/** Set a prop in this object to a new value. */
	set<K extends Key<T>>(key: K, value: T[K]): void {
		this.next(withProp(this.data, key, value));
	}

	/** Update several props in this object. */
	update(updates: Transformers<T>): void {
		this.next(transformData(this.data, updates));
	}

	/** Delete this result. */
	delete(): void {
		this.next(null);
	}
}
