import { State } from "./State.js";

/** State that stores a boolean and has additional methods to help with that. */
export class BooleanState extends State<boolean> {
	constructor(initial = false) {
		super(initial);
	}

	/** Toggle the current boolean value. */
	toggle(): void {
		this.next(this.value ? false : true);
	}
}
