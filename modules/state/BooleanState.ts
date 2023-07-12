import type { NONE } from "../util/constants.js";
import { State } from "./State.js";

/** State that stores a boolean and has additional methods to help with that. */
export class BooleanState extends State<boolean> {
	constructor(value: boolean | typeof NONE = false, time?: number) {
		super(value, time);
	}

	/** Toggle the current boolean value. */
	toggle(): void {
		this.value = !this.value;
	}
}
