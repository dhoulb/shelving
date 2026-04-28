import { Store } from "./Store.js";

/** Store that just stores a simple value. */
export class ValueStore<T> extends Store<T, T> {
	// Implement to passthrough.
	override convert(value: T): T {
		return value;
	}
}
