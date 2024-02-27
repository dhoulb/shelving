import type { Data, DataKey } from "../util/data.js";
import type { Updates } from "../util/update.js";
import { withProp } from "../util/object.js";
import { getRequired } from "../util/optional.js";
import { updateData } from "../util/update.js";
import { Store } from "./Store.js";

/** Store a data object. */
export class DataStore<T extends Data> extends Store<T> {
	/** Get the data of this store. */
	get data(): T {
		return this.value;
	}

	/** Set the data of this store. */
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

/** Store an optional data object. */
export class OptionalDataStore<T extends Data> extends Store<T | undefined> {
	/** Get current data value of this store (or throw `Promise` that resolves to the next required value). */
	get data(): T {
		return getRequired(this.value);
	}

	/** Set the data of this store. */
	set data(data: T) {
		this.value = data;
	}

	/** Does the data exist or not? */
	get exists(): boolean {
		return !!this.value;
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
