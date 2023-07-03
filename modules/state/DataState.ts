import type { Data, DataKey } from "../util/data.js";
import type { Updates } from "../util/update.js";
import { getRequired } from "../util/null.js";
import { withProp } from "../util/object.js";
import { updateData } from "../util/update.js";
import { State } from "./State.js";

/** State that stores a data object and has additional methods to help with that. */
export class DataState<T extends Data> extends State<T> {
	/** Get the data of this state. */
	get data(): T {
		return this.value;
	}

	/** Set the data of this state. */
	set data(data: T) {
		this.value = data;
	}

	/** Update several props in this data. */
	update(updates: Updates<T>): void {
		this.value = updateData(this.data, updates);
	}

	/** Update a single named prop in this data. */
	getProp<K extends DataKey<T>>(name: K): T[K] {
		return this.data[name];
	}

	/** Update a single named prop in this data. */
	setProp<K extends DataKey<T>>(name: K, value: T[K]): void {
		this.value = withProp(this.data, name, value);
	}
}

/** State that stores an optional data object and has additional methods to help with that. */
export class OptionalDataState<T extends Data> extends State<T | undefined> {
	/** Get current data value of this state (or throw `Promise` that resolves to the next required value). */
	get data(): T {
		return getRequired(this.value);
	}

	/** Set the data of this state. */
	set data(data: T) {
		this.value = data;
	}

	/** Does the data exist or not? */
	get exists(): boolean {
		return !this.loading && !!this.value;
	}

	/** Update several props in this data. */
	update(updates: Updates<T>): void {
		this.value = updateData(this.data, updates);
	}

	/** Update a single named prop in this data. */
	getProp<K extends DataKey<T>>(name: K): T[K] {
		return this.data[name];
	}

	/** Update a single named prop in this data. */
	setProp<K extends DataKey<T>>(name: K, value: T[K]): void {
		this.value = withProp(this.data, name, value);
	}

	/** Set the data to `undefined`. */
	unset(): void {
		this.value = undefined;
	}
}
