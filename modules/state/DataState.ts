import { Key, withProp, Data } from "../util/data.js";
import { PropTransformers, transformData } from "../util/transform.js";
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
	update(updates: PropTransformers<T>): void {
		this.next(transformData(this.data, updates));
	}
}
