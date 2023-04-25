import type { Data, DataKey } from "../util/data.js";
import type { Transformer, Transformers } from "../util/transform.js";
import { getData } from "../util/data.js";
import { withProp } from "../util/object.js";
import { transform, transformObject } from "../util/transform.js";
import { State } from "./State.js";

/** State that stores a data object and has additional methods to help with that. */
export class DataState<T extends Data> extends State<T> {
	/** Get the data value of this state. */
	get data(): T {
		return this.value;
	}

	/** Update a single named prop in this data. */
	getProp<K extends DataKey<T>>(name: K): T[K] {
		return this.data[name];
	}

	/** Update a single named prop in this data. */
	setProp<K extends DataKey<T>>(name: K, value: T[K]): void {
		this.set(withProp(this.data, name, value));
	}

	/** Update a single named prop in this data. */
	updateProp<K extends DataKey<T>>(name: K, update: Transformer<T[K], T[K]>): void {
		const data = this.data;
		this.set(withProp(data, name, transform(data[name], update)));
	}

	/** Update several props in this data. */
	update(updates: Transformers<T, T>): void {
		this.set(transformObject(this.data, updates));
	}
}

/** State that stores an optional data object and has additional methods to help with that. */
export class OptionalDataState<T extends Data> extends State<T | null> {
	/** Get current data value of this state (or throw `Promise` that resolves to the next required value). */
	get data(): T {
		return getData(this.value);
	}

	/** Does the data exist or not? */
	get exists(): boolean {
		return !!this.value;
	}

	/** Update several props in this data. */
	update(updates: Transformers<T, T>): void {
		this.set(transformObject(this.data, updates));
	}

	/** Update a single named prop in this data. */
	getProp<K extends DataKey<T>>(name: K): T[K] {
		return this.data[name];
	}

	/** Update a single named prop in this data. */
	setProp<K extends DataKey<T>>(name: K, value: T[K]): void {
		this.set(withProp(this.data, name, value));
	}

	/** Update a single named prop in this data. */
	updateProp<K extends DataKey<T>>(name: K, update: Transformer<T[K], T[K]>): void {
		const data = this.data;
		this.set(withProp(data, name, transform(data[name], update)));
	}

	/** Set the data to `null`. */
	unset(): void {
		this.set(null);
	}
}
