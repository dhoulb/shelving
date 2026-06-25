import { RequiredError } from "../error/RequiredError.js";
import { getGetter } from "../util/class.js";
import type { Data, DataKey } from "../util/data.js";
import type { AnyCaller } from "../util/function.js";
import { withProp } from "../util/object.js";
import type { Updates } from "../util/update.js";
import { updateData } from "../util/update.js";
import { BusyStore } from "./BusyStore.js";

/**
 * Store a data object, with helpers to read and update individual props.
 * - `update()`, `set()` replace the stored object with an immutable updated copy.
 *
 * @see https://shelving.cc/store/DataStore
 */
export class DataStore<T extends Data> extends BusyStore<T> {
	/**
	 * Get the current data of this store.
	 * - Supports suspense-like reads: throws a `Promise` while loading or the error `reason` on failure (inherited from `Store.value`).
	 *
	 * @see https://shelving.cc/store/DataStore/data
	 */
	get data(): T {
		return this.value;
	}

	/**
	 * Set the data of this store.
	 *
	 * @see https://shelving.cc/store/DataStore/data
	 */
	set data(data: T) {
		this.value = data;
	}

	/**
	 * Update several props in this data.
	 *
	 * @param updates The set of prop updates to apply.
	 * @example store.update({ age: 41, "name": "Dave" });
	 * @see https://shelving.cc/store/DataStore/update
	 */
	update(updates: Updates<T>): void {
		this.value = updateData(this.data, updates);
	}

	/**
	 * Get a single named prop from this data.
	 *
	 * @param name The name of the prop to read.
	 * @example store.get("name"); // "Dave"
	 * @see https://shelving.cc/store/DataStore/get
	 */
	get<K extends DataKey<T>>(name: K): T[K] {
		return this.data[name];
	}

	/**
	 * Set a single named prop in this data.
	 *
	 * @param name The name of the prop to set.
	 * @param value The new value for the prop.
	 * @example store.set("age", 41);
	 * @see https://shelving.cc/store/DataStore/set
	 */
	set<K extends DataKey<T>>(name: K, value: T[K]): void {
		this.value = withProp(this.data, name, value);
	}
}

/**
 * Store a data object that may be `undefined` (e.g. a document that may not exist).
 * - Reading `data` or calling `require()` throws `RequiredError` when the value is `undefined`.
 * - `delete()` sets the value back to `undefined`.
 *
 * @see https://shelving.cc/store/OptionalDataStore
 */
export class OptionalDataStore<T extends Data> extends BusyStore<T | undefined> {
	/**
	 * Get the current data of this store, or throw if it is not set.
	 * - Supports suspense-like reads: throws a `Promise` while loading or the error `reason` on failure (inherited from `Store.value`).
	 *
	 * @see https://shelving.cc/store/OptionalDataStore/data
	 */
	get data(): T {
		return this.require(getGetter(this, "data"));
	}

	/**
	 * Set the data of this store.
	 *
	 * @see https://shelving.cc/store/OptionalDataStore/data
	 */
	set data(data: T) {
		this.value = data;
	}

	/**
	 * Whether the data currently exists (is not `undefined`).
	 *
	 * @see https://shelving.cc/store/OptionalDataStore/exists
	 */
	get exists(): boolean {
		return !!this.value;
	}

	/**
	 * Require the data of this store, or throw `RequiredError` if it is not set.
	 *
	 * @param caller The function to attribute a thrown `RequiredError` to (defaults to `this.require`).
	 * @throws {RequiredError} If the data is `undefined`.
	 * @example store.require(); // throws if no data is set
	 * @see https://shelving.cc/store/OptionalDataStore/require
	 */
	require(caller: AnyCaller = this.require): T {
		const data = this.value;
		if (!data) throw new RequiredError("Data is empty", { caller });
		return data;
	}

	/**
	 * Update several props in this data.
	 *
	 * @param updates The set of prop updates to apply.
	 * @throws {RequiredError} If the data is `undefined`.
	 * @example store.update({ name: "Dave" });
	 * @see https://shelving.cc/store/OptionalDataStore/update
	 */
	update(updates: Updates<T>): void {
		this.value = updateData(this.require(this.update), updates);
	}

	/**
	 * Get a single named prop from this data.
	 *
	 * @param name The name of the prop to read.
	 * @throws {RequiredError} If the data is `undefined`.
	 * @example store.get("name");
	 * @see https://shelving.cc/store/OptionalDataStore/get
	 */
	get<K extends DataKey<T>>(name: K): T[K] {
		return this.require(this.get)[name];
	}

	/**
	 * Set a single named prop in this data.
	 *
	 * @param name The name of the prop to set.
	 * @param value The new value for the prop.
	 * @throws {RequiredError} If the data is `undefined`.
	 * @example store.set("name", "Dave");
	 * @see https://shelving.cc/store/OptionalDataStore/set
	 */
	set<K extends DataKey<T>>(name: K, value: T[K]): void {
		this.value = withProp(this.require(this.set), name, value);
	}

	/**
	 * Set the data to `undefined`.
	 *
	 * @example store.delete();
	 * @see https://shelving.cc/store/OptionalDataStore/delete
	 */
	delete(): void {
		this.value = undefined;
	}
}
