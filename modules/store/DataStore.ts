import { RequiredError } from "../error/RequiredError.js";
import { getGetter } from "../util/class.js";
import type { Data, DataKey } from "../util/data.js";
import type { AnyCaller } from "../util/function.js";
import { withProp } from "../util/object.js";
import type { Updates } from "../util/update.js";
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
		return this.require(getGetter(this, "data"));
	}

	/** Set the data of this store. */
	set data(data: T) {
		this.value = data;
	}

	/** Does the data exist or not? */
	get exists(): boolean {
		return !!this.value;
	}

	/** Require the data for this data store, or throw `RequiredError` if it is not set. */
	require(caller: AnyCaller = this.require): T {
		const data = this.value;
		if (!data) throw new RequiredError("Data is empty", { caller });
		return data;
	}

	/** Update several props in this data. */
	update(updates: Updates<T>): void {
		this.value = updateData(this.require(this.update), updates);
	}

	/** Update a single named prop in this data. */
	get<K extends DataKey<T>>(name: K): T[K] {
		return this.require(this.get)[name];
	}

	/** Update a single named prop in this data. */
	set<K extends DataKey<T>>(name: K, value: T[K]): void {
		this.value = withProp(this.require(this.set), name, value);
	}

	/** Set the data to `undefined`. */
	delete(): void {
		this.value = undefined;
	}
}
