import { NONE } from "../util/constants.js";
import { Store } from "./Store.js";

/**
 * Store that is explicitly allows a "loading" state when it has no value (which is also the default value).
 * - Note: All stores have know how to interpret `NONE` — this subclass simply _allows_ that through its types.
 */
export class LoadingStore<T> extends Store<T, T | typeof NONE> {
	// Override to default to `NONE`
	constructor(value: T | typeof NONE = NONE) {
		super(value);
	}

	// Implement to allow `NONE`
	override convert(value: T | typeof NONE): T | typeof NONE {
		return value;
	}
}
