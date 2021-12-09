import { Key, withProp, Data, PropTransformers, transformData } from "../util/index.js";
import { State } from "./State.js";

/** State that stores an array and has additional methods to help with that. */
export class DataState<T extends Data> extends State<T> {
	/** Set a prop in this object to a new value. */
	set<K extends Key<T>>(key: K, value: T[K]): void {
		this.next(withProp(this.value, key, value));
	}

	/** Update several props in this object. */
	update(updates: PropTransformers<T>): void {
		this.next(transformData(this.value, updates));
	}
}
