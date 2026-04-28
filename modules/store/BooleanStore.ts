import { Store } from "./Store.js";

/** Store a boolean. */
export class BooleanStore extends Store<unknown, boolean> {
	// Override to automatically convert to boolean.
	override convert(value: unknown): boolean {
		return !!value;
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
