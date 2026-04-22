import type { NONE } from "../util/constants.js";
import { Store } from "./Store.js";

/** Store a boolean. */
export class BooleanStore extends Store<boolean> {
	constructor(value: boolean | typeof NONE = false) {
		super(value);
	}

	/** Toggle the current boolean value. */
	toggle(): void {
		this.value = !this.value;
	}

	// Override for fast equality.
	override isEqual(a: boolean, b: boolean) {
		return a === b;
	}
}
