import type { NONE } from "../util/constants.js";
import { Store } from "./Store.js";

/** Store a boolean. */
export class BooleanStore extends Store<boolean> {
	constructor(value: boolean | typeof NONE = false, time?: number) {
		super(value, time);
	}

	/** Toggle the current boolean value. */
	toggle(): void {
		this.value = !this.value;
	}
}
