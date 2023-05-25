import type { StateOptions } from "./State.js";
import { State } from "./State.js";

/** State that stores a boolean and has additional methods to help with that. */
export class BooleanState extends State<boolean> {
	constructor(options: StateOptions<boolean> = {}) {
		super("value" in options ? options : { ...options, value: false });
	}

	/** Toggle the current boolean value. */
	toggle(): void {
		this.value = !this.value;
	}
}
