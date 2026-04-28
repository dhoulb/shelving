import { Store } from "./Store.js";

/** Store that just stores a simple value and does no conversion. */
export class ValueStore<T> extends Store<T, T> {
	// Override to passthrough.
	protected override _convert(value: T): T {
		return value;
	}
}
