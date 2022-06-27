import { awaitNext } from "../observe/util.js";
import { NOERROR } from "../util/constants.js";
import { Data, getData, Key, Result, withProp } from "../util/data.js";
import { PropTransformers, transformData } from "../util/transform.js";
import { State } from "./State.js";

/** State that stores an optional data object and has additional methods to help with that. */
export class ResultState<T extends Data> extends State<Result<T>> {
	/** Get the result value of this state. */
	get result(): Result<T> {
		return this.value;
	}

	/** Get current data value of this state (or throw `Promise` that resolves to the next required value). */
	get data(): T {
		if (this.reason !== NOERROR) throw this.reason;
		if (!this.exists) throw awaitNext(this).then(getData);
		return getData(this.value);
	}

	/** Set a prop in this object to a new value. */
	set<K extends Key<T>>(key: K, value: T[K]): void {
		this.next(withProp(this.data, key, value));
	}

	/** Update several props in this object. */
	update(updates: PropTransformers<T>): void {
		this.next(transformData(this.data, updates));
	}

	/** Delete this result. */
	delete(): void {
		this.next(null);
	}
}
