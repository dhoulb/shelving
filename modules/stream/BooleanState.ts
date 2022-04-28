import { State } from "./State.js";

/** State that stores a boolean and has additional methods to help with that. */
export class BooleanState extends State<boolean> {
	// Set default value to be false.
	override _value = false;

	/** Toggle the current boolean value. */
	toggle(): void {
		this.next(this._value ? false : true);
	}
}
