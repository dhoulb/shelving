import { NONE } from "../util/constants.js";
import { Store } from "./Store.js";

/**
 * Store that is explicitly allows a "loading" state when it has no value (which is also the default value).
 * - Throws a `Promise` if the user attempts to read a store that is still loading (i.e. its value is still `NONE`).
 *
 * @example const v = this.value; // Might throw `Promise` if internal storage value is `NONE`
 * @example if (!this.loading) const v = this.value; // Won't throw because we know the value is loaded.
 */
export class LoadingStore<T> extends Store<T | typeof NONE, T> {
	// Override to default to `NONE`
	constructor(value: T | typeof NONE = NONE) {
		super(value);
	}

	// Override to passthrough.
	protected override _convert(value: T | typeof NONE): T | typeof NONE {
		return value;
	}
}
