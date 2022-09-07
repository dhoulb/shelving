import { Data, getData, OptionalData } from "../util/data.js";
import { Transformers, transformData } from "../util/transform.js";
import { State } from "./State.js";

/** State that stores a data object and has additional methods to help with that. */
export class DataState<T extends Data> extends State<T> {
	/** Get the data value of this state. */
	get data(): T {
		return this.value;
	}

	/** Update several props in this data. */
	update(updates: Transformers<T>): void {
		this.set(transformData(this.data, updates));
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

	/** Update several props in this data. */
	update(updates: Transformers<T>): void {
		this.set(transformData(this.data, updates));
	}

	/** Set the data to `null`. */
	unset(): void {
		this.set(null);
	}
}
